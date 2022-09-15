'use strict';
import { StatusCodes } from 'http-status-codes';
import { getAuthTokenCookieOptions, getAuthControlCookieOptions } from '../utils/cookieOptions';
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
import { validateShoppingCartService, updateUsersShoppingCart } from '../services/shopping-cart.service';

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
        // login the user
        result = await loginUserService(email, password);
        console.log(`User Data Cart:`);
        console.log(JSON.stringify(result.userData.shoppingCart));
        // shopping cart routine; when an error occurs here, it is ignored and an empty shopping cart is returned
        try {
            const updatedShoppingCart = await validateShoppingCartService(result.userData.shoppingCart);
            // console.log(`carts:`);
            // console.log(
            //     JSON.stringify(result.userData.shoppingCart) !==
            //         JSON.stringify(updatedShoppingCart)
            // );
            console.log(JSON.stringify(result.userData.shoppingCart));
            console.log(JSON.stringify(updatedShoppingCart));
            if (JSON.stringify(result.userData.shoppingCart) !== JSON.stringify(updatedShoppingCart)) {
                result.userData.shoppingCart = updatedShoppingCart;
                await updateUsersShoppingCart(email, updatedShoppingCart);
            }
            // console.log(result.userData.shoppingCart.length);
            const shippingCosts = await getShippingCostsService(result.userData.shoppingCart);
            result.userData.shippingCosts = shippingCosts;
        } catch (error) {
            console.log(`[LOGIN] An error occured during a shopping cart routine:`);
            console.log(error);
            result.userData.shoppingCart = [];
        }
    } catch (error) {
        console.log(`[LOGIN] An error occured during the login of a user.`);
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

    try {
        await sendPasswordResetMailService(email, birthdate);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.senStatus(200);
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
