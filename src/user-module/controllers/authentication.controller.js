'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    loginUserService,
    registerUserService,
    verifyRegistrationService,
    sendPasswordResetMailService,
    checkResetTokenService,
    resetPasswordService,
} from '../services/authentication.service';

export {
    loginUserController,
    registerUserController,
    verifyRegistrationController,
    sendPasswordResetMailController,
    checkResetTokenController,
    resetPasswordController,
};

const loginUserController = async function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    let result;
    try {
        result = await loginUserService(email, password);
    } catch (error) {
        console.log(error);
        return next(error);
    }
    console.log(result.accessToken);
    return res
        .status(StatusCodes.OK)
        .cookie('authToken', result.accessToken)
        .json(result.responseObject);
};

const registerUserController = async function (req, res, next) {
    const data = req.body;

    try {
        await registerUserService(data);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.sendStatus(StatusCodes.CREATED);
};

const verifyRegistrationController = async function (req, res, next) {
    const verificationToken = req.params.verificationToken;
    // TODO necessary?
    if (!verificationToken) {
        return next({
            status: StatusCodes.UNAUTHORIZED,
            type: 'verification',
            message: 'No token provided.',
        });
    }

    let result;
    try {
        result = await verifyRegistrationService(verificationToken);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res
        .status(StatusCodes.OK)
        .cookie('authToken', result.accessToken)
        .json(result.responseObject);
};

const sendPasswordResetMailController = async function (req, res, next) {
    const email = req.body.email;
    const birthdate = req.body.birthdate;

    let result;
    try {
        result = await sendPasswordResetMailService(email, birthdate);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(200).json({
        info: result,
    });
};

const checkResetTokenController = async function (req, res, next) {
    const receivedToken = req.params.token;

    try {
        await checkResetTokenService(receivedToken);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(200).json({
        message: 'Password reset link is valid.',
    });
};

const resetPasswordController = async function (req, res, next) {
    const receivedToken = req.params.token;
    const password = req.body.password;

    try {
        await resetPasswordService(receivedToken, password);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(200).json({
        message: 'Password successfully reset.',
    });
};
