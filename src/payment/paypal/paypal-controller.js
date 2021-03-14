'use strict';

import {
    createSignUpLink,
    // createPaypalOrder,
    // capturePaypalOrder,
} from './paypal-rest-client';
import { createPaypalOrder, capturePaypalOrder } from './paypal-sdk-service';

export {
    createSignUpLinkController,
    createPaypalOrderController,
    capturePaypalOrderController,
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

    let orderId;
    try {
        orderId = await createPaypalOrder(orderData);
    } catch (error) {
        console.log(error);
        res.sendStatus(500); // send only status 500 back to the paypal smart buttons
    }

    return res.json({
        id: orderId,
    });
};

const capturePaypalOrderController = async function (req, res, next) {
    const orderId = req.body.orderId;
    const orderData = req.body.orderData;

    let captureId;
    try {
        captureId = await capturePaypalOrder(orderId, orderData);
    } catch (error) {
        // Catch the funding source failed error
        if (
            JSON.parse(error._originalError?.text).details[0]?.issue ===
            'INSTRUMENT_DECLINED'
        ) {
            console.log(JSON.parse(error._originalError.text));
            res.status(error.statusCode).json(
                JSON.parse(error._originalError.text)
            );
            return;
        }
        // Catch other errors
        return next({
            status: 500,
            message: 'Error while creating the paypal order.',
        });
    }

    return res.sendStatus(200);
};
