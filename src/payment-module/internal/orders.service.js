'use strict';

import { getOrderModel } from '../../../src/data-models/order-model';
import { sendNodemailerMail } from '../../mailing/nodemailer';
import { contentType } from '../../mailing/enums/contentType';

// database operations
import {
    readOneOperation,
    updateOneOperation,
    createOneOperation,
    databaseEntity,
} from '../../storage/database-operations';
// import { updateOneOperation } from '../../storage/database-operations/update-one-operation';
// import { createOneOperation } from '../../storage/database-operations/create-one-operation';

export {
    onboardingDataService,
    onboardingData2Service,
    saveWebhookData,
    saveMerchantId,
    createOrderDataStructure,
    saveCaptureIdsToOrders,
    handleIncompleteCaptures,
    fetchMerchantIds,
    createOrderArray,
    updateProductStockAmount,
    insertOrders,
    emptyShoppingCart,
    sendNotificationEmails,
};

async function onboardingDataService(
    storeId,
    userEmail,
    merchantId,
    merchantIdInPayPal,
    permissionsGranted,
    consentStatus,
    productIntentId,
    productIntentID,
    isEmailConfirmed,
    accountStatus
) {
    console.log(`Received store id: ${storeId}`);
    // Validate store id & check if values are not already set
    const store = await fetchAndValidateStore(storeId);
    if (store.payment.paypal.common.merchantIdInPayPal) {
        throw new Error(
            'There is already a merchantIdInPayPal stored for this store.'
        );
    }
    if (store.userEmail !== userEmail) {
        throw new Error('User not authorized to edit this store.');
    }

    // save data to store (paypal + status)
    // TODO check status
    try {
        await updateOneOperation(
            'stores',
            {
                _id: storeId,
            },
            {
                'payment.registered': true,
                'payment.paypal.common.merchantId': merchantId,
                'payment.paypal.common.merchantIdInPayPal': merchantIdInPayPal,
                'payment.paypal.common.permissionsGranted': permissionsGranted,
                'payment.paypal.common.consentStatus': consentStatus,
                'payment.paypal.common.productIntentId': productIntentId,
                'payment.paypal.common.productIntentID': productIntentID,
                'payment.paypal.common.consentStatus': consentStatus,
                'payment.paypal.common.isEmailConfirmed': isEmailConfirmed,
                'payment.paypal.common.accountStatus': accountStatus,
                'activationSteps.paymentMethodRegistered': true,
            },
            'set'
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
    return;
}

/**
 * The function validates if the user is the owner of the store and it updates the store (= save the merchant id and updates the status)
 * @param {string} storeId
 * @param {string} userEmail
 * @param {string} merchantIdInPayPal
 * @returns
 */
async function onboardingData2Service(storeId, userEmail, merchantIdInPayPal) {
    // Validate store id & check if values are not already set
    const store = await fetchAndValidateStore(storeId);
    if (store.payment.paypal.common.merchantIdInPayPal) {
        throw new Error(
            'There is already a merchantIdInPayPal stored for this store.'
        );
    }
    if (store.userEmail !== userEmail) {
        throw new Error('User not authorized to edit this store.');
    }

    // save data to store (paypal + status)
    // TODO check status
    try {
        await updateOneOperation(
            'stores',
            {
                _id: storeId,
            },
            {
                'payment.paypal.common.merchantIdInPayPal': merchantIdInPayPal,
                'activationSteps.paymentMethodRegistered': true,
            },
            'set'
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
    return;
}

/**
 * The function saves the merchant id to the stoer with the provided tracking id (=store id)
 * @param {string} merchantId
 * @param {string} trackingId
 */
async function saveMerchantId(merchantId, trackingId) {
    const store = await fetchAndValidateStore(trackingId);
    if (store.payment.paypal.common.merchantIdInPayPal) {
        throw new Error(
            'There is already a merchantIdInPayPal stored for this store.'
        );
    }
    // console.log(merchantId);
    // console.log(trackingId);
    await updateOneOperation(
        'stores',
        {
            _id: trackingId,
        },
        {
            'payment.paypal.common.merchantIdInPayPal': merchantId,
            'activationSteps.paymentMethodRegistered': true,
        },
        'set'
    );

    return;
}

/**
 * The function saves the data object received from a paypal webhook.
 * @param {object} webhookData
 */
async function saveWebhookData(webhookData) {
    await createOneOperation('paypalWebhooks', webhookData);

    return;
}

/**
 * The function creates the order Object out of the cart data ([[{ProductObject}, PurchasedAmount],[{ProductObject}, PurchasedAmount]])
 * Return data: { "storeId 1": {store: {merchantId: ""}, products: [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }}
 * @param {Array} cartArray [[{ProductObject}, PurchasedAmount],[{ProductObject}, PurchasedAmount]]
 */
async function createOrderDataStructure(cartArray) {
    // Create a data structure like: { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }
    let orderObject = {};
    for (const element of cartArray) {
        const amount = element[1];
        const product = await fetchAndValidateProduct(element[0], amount);

        // Check if store id in order object, if not add it
        if (!(product.storeId in orderObject)) {
            // Validate if store id exists & fetch the store
            const store = await fetchAndValidateStore(product.storeId);
            console.log(store.payment.paypal.common.merchantId);
            // add store data and product to the orderObject
            orderObject[product.storeId] = {
                store: {
                    merchantIdInPayPal:
                        store.payment.paypal.common.merchantIdInPayPal,
                    merchantEmailInPayPal:
                        store.payment.paypal.common.merchantEmailInPayPal,
                },
                products: [{ product: product, amount: amount }],
            };
            continue;
        }
        orderObject[product.storeId].products.push({
            product: product,
            amount: amount,
        });
    }
    return orderObject;
}

/**
 * The function fetches a store and returns it. When the id is invalid, an error is thrown
 * @param {string} storeId
 */
async function fetchAndValidateStore(storeId) {
    const findResult = await readOneOperation(databaseEntity.STORES, {
        _id: storeId,
    });

    if (!findResult) {
        throw new Error(
            `A store with the store id ${storeId} could not be found.`
        );
    }
    return findResult;
}

/**
 * The function fetches the product and throws errors if it is out of stock (compared to the ordered amount)
 * or if the id was not found
 * @param {Object} orderedProduct
 * @param {number} orderedAmount
 */
async function fetchAndValidateProduct(orderedProduct, orderedAmount) {
    const findResult = await readOneOperation(
        'products',
        {
            _id: orderedProduct._id,
        },
        { imageDetails: 0, imgSrc: 0 }
    );

    if (!findResult) {
        throw new Error(`Wrong product id (${orderedProduct._id}) provided!`);
    }
    // Check if product is out of stock
    if (orderedAmount > findResult.stockAmount) {
        throw new Error(
            `Product (${findResult._id}; ${findResult.title}) out of stock!`
        );
    }

    // Remove the stock Amount from the product, since we dont need it in the order
    delete findResult.stockAmount;

    return findResult;
}

// ##################################################################################### Internal Order Procedure (Part 1)

/**
 * Creates an array which contains all the orders from the request in the order format
 * @param {object} orderObject
 * @param {object} orderData
 * @param {string} userEmail
 * @param {string} paypalOrderId
 * @returns
 */
function createOrderArray(orderObject, orderData, userEmail, paypalOrderId) {
    let orderArray = [];
    // iterate over stores
    const storeIds = Object.keys(orderObject);
    for (let i = 0; i < storeIds.length; i++) {
        const productArray = orderObject[storeIds[i]].products;

        const orderOptions = {
            arrayIndex: i,
            storeId: storeIds[i],
            userEmail: userEmail,
            datetimeCreated: new Date().toISOString(),
            datetimeAdjusted: '',
            shippingType: 'delivery',
            // products: productArray,
            currencyCode: orderData.currencyCode,
            totalSum: 0,
            billingAddress: orderData.billingAddress,
            shippingAddress: orderData.shippingAddress,
            paypalOrderId: paypalOrderId,
            paypalStatus: 'captured',
        };
        const order = getOrderModel(orderOptions);

        let totalProductSum = 0;
        // iterate over products to calculate the total sum and push the products to the order
        for (const element of productArray) {
            // for (let i = 0; i < productArray.length; i++) {
            // check if product exists and use it in the order
            // let product = await fetchAndValidateProduct(productArray[i]);
            // const product = productArray[i];
            order.products.push(element);
            totalProductSum =
                totalProductSum + element.product.priceFloat * element.amount;
        }

        // Calculation
        const totalTax = totalProductSum * 0.07;
        const platformFee = totalProductSum * 0.1;
        const shippingCosts = 0.0; // value is configuered by store owner
        const transferAmount = totalProductSum - platformFee + shippingCosts;

        // to string
        order.totalSum = totalProductSum.toFixed(2);
        order.totalTax = totalTax.toFixed(2);
        order.platformFee = platformFee.toFixed(2);
        order.shippingCosts = shippingCosts.toFixed(2);
        order.transferAmount = transferAmount.toFixed(2);

        // push to order Array
        orderArray.push(order);
    }
    if (!orderArray.length) {
        throw new Error('Order Array is empty');
    }
    return orderArray;
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

// ##################################################################################### Capture Order Part 2
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
            'orders',
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
            'orders',
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
}

/**
 * The function undos the product decrease which was performed at the create order process step,
 * when an error occurred at the capture order process step
 * @param {string} paypalOrderId the paypal order id
 */
async function undoProductStockDecrease(paypalOrderId) {
    const order = await fetchAndValidateOrderByPaypalId(paypalOrderId);
    console.log(order);
    let promiseArray = [];
    for (const element of order.products) {
        const result = await updateOneOperation(
            'products',
            {
                _id: element.product._id,
            },
            {
                stockAmount: element.amount,
            },
            'inc'
        );

        promiseArray.push(result);
    }
    await Promise.all(promiseArray);
    return;
}

/**
 * The function fetches an order by its paypal order id and throws an error if no order was found
 * @param {string} paypalOrderId the paypal order id
 */
async function fetchAndValidateOrderByPaypalId(paypalOrderId) {
    const order = await readOneOperation('orders', {
        'payment.details.paypalOrderId': paypalOrderId,
    });

    if (!order) {
        throw new Error(`No order to the order id ${orderId} has been found.`);
    }
    return order;
}

async function sendNotificationEmails(customerEmail, captureArray) {
    let promises = [];
    // send customer notification
    let mailOptions = {
        email: customerEmail,
        contentType: contentType.ORDER_CREATED_CUSTOMER,
    };
    promises.push(sendNodemailerMail(mailOptions));

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
    Promise.all(promises);
}

// ##################################################################################### Fetch Merchant Ids
/**
 * The function fetches all the stores which are contained in the shopping cart and returns a string
 * array which contains the merchant ids from paypal
 * @param {array} shoppingCart
 */
async function fetchMerchantIds(storeIds) {
    // console.log(storeIds);
    let merchantIdArray = [];
    for (const storeId of storeIds) {
        const store = await fetchAndValidateStore(storeId);
        // console.log(store.payment.paypal);
        merchantIdArray.push(store.payment.paypal.common.merchantIdInPayPal);
    }

    merchantIdArray = [...new Set(merchantIdArray)]; // remove duplicates

    return merchantIdArray;
}
