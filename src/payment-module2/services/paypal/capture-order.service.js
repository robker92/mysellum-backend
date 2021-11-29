'use strict';

import {
    getMongoDbClient,
    getMongoDbTransactionWriteOptions,
} from '../../../storage/mongodb/setup';

// database operations
import {
    readOneOperation,
    readManyOperation,
    updateOneOperation,
    createOneOperation,
    databaseEntity,
} from '../../../storage/database-operations';

import * as paypalSdk from '@paypal/checkout-server-sdk';
import { PAYPAL_BN_CODE } from '../../../config';
import { paypalClient } from './client/sdk/paypal-sdk-client';

import { sendNodemailerMail, contentType } from '../../../mailing/nodemailer';

// import { checkIfInstrumentDeclined } from '../utils/checkForPaypalInstrumentDeclinedError';
import {
    fetchAndValidateStore,
    createOrderDataStructure,
    createOrderArray,
} from '../../utils/order-utils';

export { capturePaypalOrderService };

async function capturePaypalOrderService(orderId, orderData, userEmail) {
    // Procedure:
    // Create Order with status captured + paypal Ref Id + paypal order id
    // Decrease stock amounts
    // Empty shopping cart
    // Capture paypal order
    let captureResult;
    try {
        captureResult = await capturePaypalOrderProcedure(
            orderId,
            orderData,
            userEmail
        );
    } catch (error) {
        console.log(error);
        throw error;
    }

    // The 2nd step is separated, because when the paypal capture is successful (= payment is done), we would lose all the internal
    // data when the following operations would be in the transaction as well

    // Procedure:
    // save capture ids to orders
    // Change status of created order: paypal to captured, steps orderReceived true & paymentReceived true
    // Send notification mails
    // TODO: (when error occured: change to incompleted -> finished true; successf. false)
    try {
        let promises = [];
        promises.push(
            saveCaptureIdsToOrders(
                orderId,
                captureResult.completeCapturesArray,
                captureResult.paypalPayer
            )
        );
        promises.push(
            handleIncompleteCaptures(
                orderId,
                captureResult.incompleteCapturesArray,
                captureResult.paypalPayer
            )
        );
        promises.push(
            sendNotificationEmails(
                userEmail,
                captureResult.completeCapturesArray
            )
        );

        await Promise.all(promises);
    } catch (error) {
        console.log(error);
        throw error;
    }

    // Now, we got the difficulty: what should happen when the paypal process was successful, but
    // we get an internal error now?

    return;
}

/**
 * Main procedure for the first part of capturing the order. Contains the following:
 * Creates the orderObject and orderArray; Inserts the orders and updates the stock amounts;
 * Emtpys the users shopping cart and captures the paypal order
 * All of the steps reside in a mongo transaction which means that if one error occurs, nothing will be saved,
 * which is the intended behaviour.
 * @param {string} orderId
 * @param {object} orderData
 * @param {string} userEmail
 * @returns
 */
async function capturePaypalOrderProcedure(orderId, orderData, userEmail) {
    let captureResult;

    // start the transaction. If an error occurs internally, everything is aborted and we don't capture the paypal order
    // if an error occurs at the capture, we don't have anything saved persistently internally
    const mongoDbSession = getMongoDbClient().startSession();
    try {
        await mongoDbSession.withTransaction(async () => {
            // Create the order object; no mongo session needed here since we only fetch and dont update
            const orderObject = await createOrderDataStructure(
                orderData.products
            );

            // Insert Orders and decrease stocks
            const orderArray = createOrderArray(
                orderObject,
                orderData,
                userEmail,
                orderId
            );

            let promises = [];
            // save new stocks
            promises.push(
                updateProductStockAmount(orderObject, mongoDbSession)
            );
            // create orders
            promises.push(insertOrders(orderArray, mongoDbSession));

            // also: empty shopping cart
            promises.push(emptyShoppingCart(userEmail, mongoDbSession));
            await Promise.all(promises);

            // finally - when all internal steps were successful - , capture the paypal order and perform the payment
            captureResult = await capturePaypalOrder(orderId, orderData);
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await mongoDbSession.endSession();
    }

    return captureResult;
}

/**
 * The function decreases the product stock amounts by the purchased amounts from the order
 * @param {object} orderObject the order object which contains
 * @param {*} mongoDbSession the mongo db session
 */
async function updateProductStockAmount(orderObject, mongoDbSession) {
    let updates = [];
    const storeIds = Object.keys(orderObject);
    for (const storeId of storeIds) {
        const productArray = orderObject[storeId].products;
        for (const element of productArray) {
            const update = updateOneOperation(
                'products',
                {
                    _id: element.product._id,
                },
                {
                    stockAmount: -element.amount, //reduce stock amount by purchased amount
                },
                'inc',
                mongoDbSession
            );
            updates.push(update);
        }
    }
    // Wait for all updates to be done
    await Promise.all(updates);

    return;
}

/**
 * The function inserts all the orders from the orderArray and uses promise.all to wait until all insertions are done
 * @param {array} orderArray the array which contains the orders
 * @param {*} mongoDbSession the mongo db session
 */
async function insertOrders(orderArray, mongoDbSession) {
    console.log(orderArray);
    let insertions = [];
    for (const order of orderArray) {
        insertions.push(createOneOperation('orders', order, mongoDbSession));
    }

    // Wait for all insertions to be done
    await Promise.all(insertions);

    return;
}

/**
 * Sets the users shoppingcart to an empty array
 * @param {string} email
 * @param {*} mongoDbSession
 * @returns
 */
async function emptyShoppingCart(email, mongoDbSession) {
    await updateOneOperation(
        'users',
        {
            email: email,
        },
        {
            shoppingCart: [],
        },
        'set',
        mongoDbSession
    );
    return;
}

/**
 * Capture the created paypal order.
 * Returns an object which contains the capture id, an array
 * @param {String} orderId the id of the before created order
 */
async function capturePaypalOrder(orderId) {
    const request = new paypalSdk.orders.OrdersCaptureRequest(orderId);
    // Test the flow when of a failing funding source
    // request.headers[
    //     'PayPal-Mock-Response'
    // ] = `{'mock_application_codes': 'INSTRUMENT_DECLINED'}`;
    request.headers['PayPal-Partner-Attribution-Id'] = PAYPAL_BN_CODE;
    request.requestBody({});
    const capture = await paypalClient().execute(request);

    // test if status code is 207, means that not every purchase_unit could be captured
    const captureStatusCode = capture.statusCode;
    if (captureStatusCode === 207) {
        console.log(`Not all captures were successful.`);
    }

    const resultArrays = getCaptureResultArrays(capture);

    // 4. Save the capture ID to your database. Implement logic to save capture to your database for future reference.
    const captureId = capture.result.purchase_units[0].payments.captures[0].id;
    // await database.saveCaptureID(captureID);

    return {
        captureId,
        completeCapturesArray: resultArrays.completeCapturesArray,
        incompleteCapturesArray: resultArrays.incompleteCapturesArray,
        paypalPayer: capture.result.payer,
        captureStatusCode,
    };
}

/**
 * After the paypal order was successfully captured the function changes
 * the status of our internally created order to 'captured', saves the capture id and emptys
 * the shopping cart of the user
 * @param {string} paypalOrderId the paypal order id
 * @param {string} userEmail the email address of the user
 * @param {string} captureArray the paypal capture id
 * @param {string} paypalPayer payer object which is returned at the capture step
 */
async function saveCaptureIdsToOrders(
    paypalOrderId,
    captureArray,
    paypalPayer
) {
    console.log(`paypal order id: ${paypalOrderId}`);
    console.log(captureArray);
    let updates = [];
    // Iterate over the capture array and add the capture ids to the single orders (to which it belongs)
    for (const purchaseUnit of captureArray) {
        const update = updateOneOperation(
            databaseEntity.ORDERS,
            {
                'payment.details.paypalOrderId': paypalOrderId,
                'payment.details.paypalRefId': purchaseUnit.paypalRefId,
            },
            {
                'status.paypal': 'captured',
                'status.steps.orderReceived': true,
                'status.steps.paymentReceived': true,
                'payment.details.paypalCaptureIds': purchaseUnit.captureIdArray,
                'payment.payer': paypalPayer,
            }
        );

        updates.push(update);
    }
    await Promise.all(updates);

    return;
}

/**
 * When a capture was incomplete, set the status paypal to incomplete, finsihed to true and successfully to false.
 * Also, step orderReceived to true and paymentReceived to false. The payer is saved as well.
 * @param {string} paypalOrderId
 * @param {array} incompleteCaptureArray
 */
async function handleIncompleteCaptures(paypalOrderId, incompleteCaptureArray) {
    let updates = [];
    // Iterate over the capture array and add the capture ids to the single orders (to which it belongs)
    for (const purchaseUnit of incompleteCaptureArray) {
        const update = await updateOneOperation(
            databaseEntity.ORDERS,
            {
                'payment.details.paypalOrderId': paypalOrderId,
                'payment.details.paypalRefId': purchaseUnit.paypalRefId,
            },
            {
                'status.paypal': 'incomplete',
                'status.finished': true,
                'status.successfully': false,

                'status.steps.orderReceived': true,
                'status.steps.paymentReceived': false,
                'payment.payer': paypalPayer,
            }
        );

        updates.push(update);
    }
    await Promise.all(updates);

    return;
    contentType;
}

async function sendNotificationEmails(customerEmail, captureArray) {
    let promises = [];
    // send customer notification
    let mailOptions = {
        email: customerEmail,
        contentType: contentType.ORDER_CREATED_CUSTOMER,
    };
    promises.push(sendNodemailerMail(mailOptions));

    // send store notifications
    for (const purchaseUnit of captureArray) {
        const storeId = purchaseUnit.paypalRefId.substring(
            0,
            purchaseUnit.paypalRefId.indexOf('~')
        );
        const store = await fetchAndValidateStore(storeId);
        let mailOptions = {
            email: store.userEmail,
            contentType: contentType.ORDER_CREATED_STORE,
        };
        promises.push(sendNodemailerMail(mailOptions));
    }
    await Promise.all(promises);

    return;
}

/**
 * The function iterates over the capture result und build the result array in the format: [{captureIdArray,paypalRefId}]
 * @param {object} capture
 */
function getCaptureResultArrays(capture) {
    let completeCapturesArray = []; //  format: [{captureIdArray,paypalRefId}]
    let incompleteCapturesArray = []; // format: [{captureId,paypalRefId}]
    // Iterate over purchase units
    for (const capturePurchaseUnit of capture.result.purchase_units) {
        let captureIdArray = [];
        // iterate over the captures of a purchase unit and push them into an array
        // -> Usually, there is one capture per purchase unit, but to be safe we save them as an array
        for (const capture of capturePurchaseUnit.payments.captures) {
            // check if the capture was successful. if not, add it to the incomplete array and continue
            if (capture.status !== 'COMPLETED') {
                console.log(`Incomplete capture found`);
                const incompleteCaptureElement = {
                    captureId: capture.id,
                    paypalRefId: capturePurchaseUnit.reference_id,
                };
                incompleteCapturesArray.push(incompleteCaptureElement);
                continue;
            }
            captureIdArray.push(capture.id);
        }
        const completeCaptureElement = {
            captureIdArray: captureIdArray,
            paypalRefId: capturePurchaseUnit.reference_id,
        };
        // push the information for a purchase unit to the result array
        completeCapturesArray.push(completeCaptureElement);
    }
    return { completeCapturesArray, incompleteCapturesArray };
}
