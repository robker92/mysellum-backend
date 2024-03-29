'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    getSingleStoreService,
    createStoreService,
    editStoreService,
    deleteStoreService,
    adminActivationService,
    adminDeactivationService,
} from '../services/stores.service';

export {
    getSingleStoreController,
    createStoreController,
    editStoreController,
    deleteStoreController,
    adminActivationController,
    adminDeactivationController,
};

const getSingleStoreController = async function (req, res, next) {
    const storeId = req.params.storeId;
    const userEmail = req.userEmail;

    let result;
    try {
        result = await getSingleStoreService(storeId, userEmail);
    } catch (error) {
        return next(error);
    }

    return res.status(StatusCodes.OK).send(result);
};

const createStoreController = async function (req, res, next) {
    const data = req.body;
    const userEmail = req.userEmail;

    let store;
    try {
        store = await createStoreService(data, userEmail);
    } catch (error) {
        return next(error);
    }

    res.status(StatusCodes.OK).json({
        store: store,
    });
};

const editStoreController = async function (req, res, next) {
    const data = req.body;
    const storeId = req.params.storeId;
    const userEmail = req.userEmail;

    let result;
    try {
        result = await editStoreService(data, storeId, userEmail);
    } catch (error) {
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        legalDocuments: result.legalDocuments,
    });
};

const deleteStoreController = async function (req, res, next) {
    const userEmail = req.userEmail;
    const storeId = req.params.storeId;

    try {
        await deleteStoreService(data, storeId, userEmail);
    } catch (error) {
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
};

const adminActivationController = async function (req, res, next) {
    const storeId = req.params.storeId;
    // return res.sendStatus(StatusCodes.OK);
    try {
        await adminActivationService(storeId);
    } catch (error) {
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
};

const adminDeactivationController = async function (req, res, next) {
    const storeId = req.params.storeId;
    // return res.sendStatus(StatusCodes.OK);
    try {
        await adminDeactivationService(storeId);
    } catch (error) {
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
};
