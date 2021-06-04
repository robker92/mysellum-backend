'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    addToShoppingCartService,
    removeFromShoppingCartService,
    updateShoppingCartService,
} from '../services/shopping-cart.service';

export {
    addToShoppingCartController,
    removeFromShoppingCartController,
    updateShoppingCartController,
};

const addToShoppingCartController = async function (req, res, next) {
    const email = req.params.email;
    const addedProduct = req.body.product;
    const addedAmount = parseInt(req.body.amount);

    let result;
    try {
        result = await addToShoppingCartService(
            email,
            addedProduct,
            addedAmount
        );
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        message: 'Products successfully added to cart!',
        shoppingCart: result,
    });
};

const removeFromShoppingCartController = async function (req, res, next) {
    const email = req.params.email;
    const removedProduct = req.body.product;
    const removedAmount = req.body.amount;

    let result;
    try {
        result = await removeFromShoppingCartService(
            email,
            removedProduct,
            removedAmount
        );
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        message: 'Products successfully removed from cart!',
        shoppingCart: result,
    });
};

const updateShoppingCartController = async function (req, res, next) {
    const email = req.params.email;
    const shoppingCart = req.body.shoppingCart;

    try {
        await updateShoppingCartService(email, shoppingCart);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
};
