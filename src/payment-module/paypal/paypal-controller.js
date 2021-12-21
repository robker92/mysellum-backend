// Order TODOs
// TODO: user + store order overview + move it to payment module

// Frontend order:
// TODO: user + store order overview

'use strict';

import {
    createSignUpLink,
    validatePaypalMerchantId,
    fetchWebhookPaypalMerchantId,
} from './rest/paypal-rest-client';

import {
    createPaypalOrder,
    capturePaypalOrderProcedure,
} from './sdk/paypal-sdk-service';

import {
    saveWebhookData,
    saveMerchantId,
    onboardingDataService,
    onboardingData2Service,
    createOrderDataStructure,
    saveCaptureIdsToOrders,
    handleIncompleteCaptures,
    fetchMerchantIds,
    sendNotificationEmails,
} from '../internal/orders.service';

import { checkIfInstrumentDeclined } from './utils/checkForPaypalInstrumentDeclinedError';
import { validateAddress } from './validators/address-validator';
import { validateCurrencyCode } from './validators/currency-code-validator';

export {
    createSignUpLinkController,
    onboardingDataController,
    onboardingData2Controller,
    createPaypalOrderController,
    capturePaypalOrderController,
    fetchMerchantIdsController,
    paypalOnboardingWebhookController,
    paypalWebhookTestController,
};

const createSignUpLinkController = async function (req, res, next) {
    const returnLink = req.body.returnLink;
    const trackingId = req.body.trackingId;

    let responseData;
    try {
        responseData = await createSignUpLink(returnLink, trackingId);
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while creating the sign-up link.',
        });
    }

    return res.status(200).json({
        message: 'Sign-up link creation successful!',
        data: responseData,
    });
};

const onboardingDataController = async function (req, res, next) {
    const storeId = req.params.storeId;
    const userEmail = req.userEmail;
    const merchantId = req.body.merchantId;
    const merchantIdInPayPal = req.body.merchantIdInPayPal;
    const permissionsGranted = req.body.permissionsGranted;
    const consentStatus = req.body.consentStatus;
    const productIntentId = req.body.productIntentId;
    const productIntentID = req.body.productIntentID;
    const isEmailConfirmed = req.body.isEmailConfirmed;
    const accountStatus = req.body.accountStatus;

    // const {
    //     storeId,
    //     userEmail,
    //     merchantId,
    //     merchantIdInPayPal,
    //     permissionsGranted,
    //     consentStatus,
    //     productIntentId,
    //     productIntentID,
    //     isEmailConfirmed,
    //     accountStatus,
    // } = req.body;

    // const {
    //     merchantId,
    //     merchantIdInPayPal,
    //     permissionsGranted,
    //     consentStatus,
    //     productIntentId,
    //     productIntentID,
    //     isEmailConfirmed,
    //     accountStatus,
    // } = req.body;

    try {
        // Validate Paypal Ids
        await validatePaypalMerchantId(merchantIdInPayPal);
        // Validate store id & store owner & check if values are not already set
        // save data to store (paypal + status)

        // TODO check activation
        await onboardingDataService(
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
        );
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while saving the onboarding data.',
        });
    }
    return res.sendStatus(200);
};

const onboardingData2Controller = async function (req, res, next) {
    const storeId = req.params.storeId;
    const userEmail = req.userEmail;

    let result;
    try {
        // validate store -> check user; check if payment already registered
        // TODO
        // Validate Paypal Ids
        result = await validatePaypalMerchantId('', storeId);
        // Validate store id & store owner & check if values are not already set
        // save data to store (paypal + status)

        await onboardingData2Service(storeId, userEmail, result.merchant_id);
        // save paypal data and adjust store status

        // TODO check activation
        // await onboardingDataService(
        //     storeId,
        //     userEmail,
        //     merchantId,
        //     merchantIdInPayPal,
        //     permissionsGranted,
        //     consentStatus,
        //     productIntentId,
        //     productIntentID,
        //     isEmailConfirmed,
        //     accountStatus
        // );
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while saving the onboarding data.',
        });
    }
    return res.sendStatus(200);
};

const createPaypalOrderController = async function (req, res, next) {
    const orderData = req.body;
    const userEmail = req.userEmail;

    let orderId;
    try {
        await validateAddress(orderData.billingAddress);
        await validateAddress(orderData.shippingAddress);
        validateCurrencyCode(orderData.currencyCode);
        // Get the order format { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }
        const orderObject = await createOrderDataStructure(orderData.products);
        const response = await createPaypalOrder(orderData, orderObject);
        orderId = response.id;
    } catch (error) {
        console.log(error);
        return res.sendStatus(500); // send only status 500 back to the paypal smart buttons
    }

    return res.json({
        id: orderId,
    });
};

const capturePaypalOrderController = async function (req, res, next) {
    const orderId = req.body.orderId;
    const orderData = req.body.orderData;
    const userEmail = req.userEmail;

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
        if (checkIfInstrumentDeclined(error) === true) {
            res.status(error.statusCode).json(
                JSON.parse(error._originalError.text)
            );
            return;
        }
        // Catch other errors
        console.log(error);
        return next({
            status: 500,
            message: 'Error while capturing the paypal order.',
        });
    }

    // The 2nd step is separated, because when the paypal capture is successful (= payment is done), we would lose all the internal
    // data when the following operations would be in the transaction as well

    // Procedure:
    // save capture ids to orders
    // Change status of created order: paypal to captured, steps orderReceived true & paymentReceived true
    // Send notification mails
    // TODO: (when error occured: change to incompleted -> finished true; successf. false)
    try {
        await saveCaptureIdsToOrders(
            orderId,
            captureResult.completeCapturesArray,
            captureResult.paypalPayer
        );
        await handleIncompleteCaptures(
            orderId,
            captureResult.incompleteCapturesArray,
            captureResult.paypalPayer
        );
        await sendNotificationEmails(
            userEmail,
            captureResult.completeCapturesArray
        );
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Internal error while saving the capture Ids.',
        });
    }

    // Now, we got the difficulty: what should happen when the paypal process was successful, but
    // we get an internal error now?

    return res.sendStatus(200);
};

const fetchMerchantIdsController = async function (req, res, next) {
    const storeIds = req.body.storeIds;

    let merchantIdArray;
    try {
        merchantIdArray = await fetchMerchantIds(storeIds);
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while fetching the merchant ids.',
        });
    }
    console.log(merchantIdArray);
    console.log(merchantIdArray.length);
    if (merchantIdArray.length <= 0) {
        return res.sendStatus(500);
    }
    return res.status(200).json({
        message: 'Merchant Ids successfully fetched.',
        merchantIds: merchantIdArray,
    });
};

const paypalRefundController = async function (req, res, next) {
    const orderId = req.body.orderId;
    const products = req.body.products;

    // check auth
    // check time valid
    try {
        await refundService(orderId, products);
        await refundPaypalOrder(shoppingCart);
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while refunding the paypal order.',
        });
    }
    console.log(merchantIdArray);

    return res.status(200).json({
        message: 'Refund successful.',
    });
};

const paypalOnboardingWebhookController = async function (req, res, next) {
    const webhookData = req.body;
    // verify that webhook is valid and not malicious &
    // Execute provided Get link to receive tracking id (= internal store id)
    let resultObjct;
    try {
        resultObjct = await fetchWebhookPaypalMerchantId(
            webhookData.resource.links[0].href
        );
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Invalid Paypal URL received.',
        });
    }

    const merchantId = resultObjct.merchant_id;
    const trackingId = resultObjct.tracking_id;

    // TODO activation status
    // save merchant id and update activation status
    try {
        await saveMerchantId(merchantId, trackingId);
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while saving merchant id.',
        });
    }

    // Save webhook data
    try {
        await saveWebhookData(webhookData);
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while saving webhook data.',
        });
    }

    console.log(webhookData);
    return res.sendStatus(200);
};

const paypalWebhookTestController = async function (req, res, next) {
    console.log(req.body);
    const data = req.body;
    return res.sendStatus(200);
};
