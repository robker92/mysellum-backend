'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    addToShoppingCartService,
    removeFromShoppingCartService,
    updateShoppingCartService,
} from '../services/shopping-cart.service';
import { getShippingCostsService } from '../../store-module/services/shipping.service';

export {
    addToShoppingCartController,
    removeFromShoppingCartController,
    updateShoppingCartController,
};

const addToShoppingCartController = async function (req, res, next) {
    const email = req.params.email;
    const addedProduct = req.body.product;
    const addedAmount = parseInt(req.body.amount);

    let shoppingCart;
    let shippingCosts;
    try {
        shoppingCart = await addToShoppingCartService(
            email,
            addedProduct,
            addedAmount
        );
        shippingCosts = await getShippingCostsService(shoppingCart);
    } catch (error) {
        console.log(error);
        return next(error);
    }
    // console.log(JSON.stringify(shoppingCart));
    return res.status(StatusCodes.OK).json({
        shoppingCart: shoppingCart,
        shippingCosts: shippingCosts,
    });
};

const removeFromShoppingCartController = async function (req, res, next) {
    const email = req.params.email;
    const removedProduct = req.body.product;
    const removedAmount = req.body.amount;

    let shoppingCart;
    let shippingCosts;
    try {
        shoppingCart = await removeFromShoppingCartService(
            email,
            removedProduct,
            removedAmount
        );
        shippingCosts = await getShippingCostsService(shoppingCart);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        shoppingCart: shoppingCart,
        shippingCosts: shippingCosts,
    });
};

const updateShoppingCartController = async function (req, res, next) {
    const userEmail = req.userEmail;
    const shoppingCart = req.body.shoppingCart;

    let shippingCosts;
    try {
        await updateShoppingCartService(userEmail, shoppingCart);
        shippingCosts = await getShippingCostsService(shoppingCart);
    } catch (error) {
        console.log(error);
        return next(error);
    }
    // console.log(`shippingCosts: ${shippingCosts}`);
    // console.log(JSON.stringify(shoppingCart));

    return res
        .status(StatusCodes.OK)
        .json({ shoppingCart: shoppingCart, shippingCosts: shippingCosts });
};
