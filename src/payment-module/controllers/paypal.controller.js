// Order TODOs
// TODO: user + store order overview + move it to payment module

// Frontend order:
// TODO: user + store order overview

'use strict';

import { createSignUpLink } from './rest/paypal-rest-client';

import {
    createPaypalOrder,
    capturePaypalOrderProcedure,
} from './sdk/paypal-sdk-service';

import {
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
    createPaypalOrderController,
    capturePaypalOrderController,
    fetchMerchantIdsController,
    testController,
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
    const shoppingCart = req.body.shoppingCart;

    let merchantIdArray;
    try {
        merchantIdArray = await fetchMerchantIds(shoppingCart);
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while fetching the merchant ids.',
        });
    }
    console.log(merchantIdArray);

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

const testController = async function (req, res, next) {
    const body = req.body;
    console.log(body);
    return res.sendStatus(200);
};
