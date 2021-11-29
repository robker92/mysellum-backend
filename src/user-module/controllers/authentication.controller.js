'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    getAuthTokenCookieOptions,
    getAuthControlCookieOptions,
} from '../utils/cookieOptions';
import {
    loginUserService,
    registerUserService,
    verifyRegistrationService,
    resendVerificationEmailService,
    sendPasswordResetMailService,
    checkResetTokenService,
    resetPasswordService,
} from '../services/authentication.service';
import { getShippingCostsService } from '../../store-module/services/shipping.service';
import {
    validateShoppingCartService,
    updateUsersShoppingCart,
} from '../services/shopping-cart.service';

export {
    loginUserController,
    registerUserController,
    verifyRegistrationController,
    resendVerificationEmailController,
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
        const updatedShoppingCart = await validateShoppingCartService(
            result.userData.shoppingCart
        );
        if (
            JSON.stringify(result.userData.shoppingCart) !==
            JSON.stringify(updatedShoppingCart)
        ) {
            result.userData.shoppingCart = updatedShoppingCart;
            await updateUsersShoppingCart(email, updatedShoppingCart);
        }

        const shippingCosts = await getShippingCostsService(
            result.userData.shoppingCart
        );
        result.userData.shippingCosts = shippingCosts;
    } catch (error) {
        console.log(error);
        return next(error);
    }
    console.log(result.accessToken);

    return (
        res
            .status(StatusCodes.OK)
            // .cookie('authToken', result.accessToken, getAuthTokenCookieOptions())
            // .cookie('authControl', true, getAuthControlCookieOptions()) //maxAge: 1000 * 60 * 10,
            .json({ userData: result.userData, authToken: result.accessToken })
    );
};

const registerUserController = async function (req, res, next) {
    const data = req.body;
    console.log(data);
    try {
        await registerUserService(data);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.sendStatus(StatusCodes.CREATED);
};

const resendVerificationEmailController = async function (req, res, next) {
    const data = req.body;
    console.log(data);
    try {
        await resendVerificationEmailService(data.email, data.birthdate);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
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
        result.userData.shippingCosts = 0;
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return (
        res
            .status(StatusCodes.OK)
            // .cookie('authToken', result.accessToken, getAuthTokenCookieOptions())
            // .cookie('authControl', true, getAuthControlCookieOptions()) //maxAge: 1000 * 60 * 10,
            .json({ userData: result.userData, authToken: result.accessToken })
    );
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
