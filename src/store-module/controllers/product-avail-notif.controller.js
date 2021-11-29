'use strict';

import { StatusCodes } from 'http-status-codes';

import {
    registerProductAvailNotificationService,
    getNotificationsService,
    sendNotificationsService,
} from '../services/product-avail-notif.service';

export {
    registerProductAvailNotificationController,
    checkNotificationsEndpoint,
    sendNotificationsEndpoint,
};

const registerProductAvailNotificationController = async function (
    req,
    res,
    next
) {
    const email = req.body.email;
    const storeId = req.body.storeId;
    const productId = req.body.productId;
    const firstName = req.body.firstName || '';
    const lastName = req.body.lastName || '';

    //check if email already registered?
    const options = {
        email: email,
        storeId: storeId,
        productId: productId,
    };
    try {
        await registerProductAvailNotificationService(options);
    } catch (error) {
        return next(error);
    }
    return res.sendStatus(StatusCodes.CREATED);
};

const checkNotificationsEndpoint = async function (req, res, next) {
    let storeId = req.body.storeId;
    let productId = req.body.productId;

    let checkResult = await getNotificationsService(storeId, productId);

    res.status(StatusCodes.OK).json({
        success: true,
        result: checkResult,
    });
};

const sendNotificationsEndpoint = async function (req, res, next) {
    let storeId = req.body.storeId;
    let productId = req.body.productId;

    await sendNotificationsService(storeId, productId);

    res.sendStatus(StatusCodes.OK);
};
