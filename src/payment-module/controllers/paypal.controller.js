'use strict';

import {
    // createSignUpLinkService,
    validatePaypalMerchantId,
    fetchWebhookPaypalMerchantId,
    // onboardingDataService,
    // onboardingData2Service,
    saveWebhookData,
    saveMerchantId,
    createOrderDataStructure,
    fetchMerchantIds,
} from '../services/paypal-utils.service';

// import {
//     createPaypalOrder,
//     capturePaypalOrderProcedure,
//     saveCaptureIdsToOrders,
//     handleIncompleteCaptures,
// } from '../services/paypal-orders.service';

// import { sendNotificationEmails } from '../services/orders.service';

import { checkIfInstrumentDeclined } from '../utils/checkForPaypalInstrumentDeclinedError';
// import { validateAddress } from '../utils/validators/address-validator';
// import { validateCurrencyCode } from '../utils/validators/currency-code-validator';

import {
    capturePaypalOrderService,
    createPaypalOrderService,
    createSignUpLinkService,
    fetchMerchantIdsService,
    onboardingDataService,
} from '../services/paypal';

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
        responseData = await createSignUpLinkService(returnLink, trackingId);
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
    const {
        merchantId,
        merchantIdInPayPal,
        permissionsGranted,
        consentStatus,
        productIntentId,
        productIntentID,
        isEmailConfirmed,
        accountStatus,
    } = req.body;

    try {
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
        orderId = await createPaypalOrderService(orderData, userEmail);
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

    try {
        await capturePaypalOrderService(orderId, orderData, userEmail);
    } catch (error) {
        if (checkIfInstrumentDeclined(error) === true) {
            return res
                .status(error.statusCode)
                .json(JSON.parse(error._originalError.text));
        }
        // Catch other errors
        console.log(error);
        return next({
            status: 500,
            message: 'Error while capturing the paypal order.',
        });
    }

    return res.sendStatus(200);
};

const fetchMerchantIdsController = async function (req, res, next) {
    const storeIds = req.body.storeIds;

    let merchantIdArray;
    try {
        merchantIdArray = await fetchMerchantIdsService(storeIds);
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while fetching the merchant ids.',
        });
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
