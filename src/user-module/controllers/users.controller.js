'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    getUserDataService,
    updateUserDataService,
    addStoreToFavoritesService,
    removeStoreFromFavoritesService,
} from '../services/users.service';

export {
    getUserDataController,
    updateUserDataController,
    addStoreToFavoritesController,
    removeStoreFromFavoritesController,
};

const getUserDataController = async function (req, res, next) {
    const userEmail = req.userEmail;

    let result;
    try {
        result = await getUserDataService(userEmail);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        user: result,
    });
};

const updateUserDataController = async function (req, res, next) {
    const userEmail = req.userEmail;
    const data = req.body;

    let result;
    try {
        result = await updateUserDataService(userEmail, data);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        user: result,
    });
};

const addStoreToFavoritesController = async function (req, res, next) {
    const userEmail = req.userEmail;
    const storeId = req.body.storeId;

    try {
        await addStoreToFavoritesService(userEmail, storeId);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
};

const removeStoreFromFavoritesController = async function (req, res, next) {
    const userEmail = req.userEmail;
    const storeId = req.params.storeId;

    try {
        await removeStoreFromFavoritesService(userEmail, storeId);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
};
