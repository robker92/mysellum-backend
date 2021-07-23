'use strict';
import { StatusCodes } from 'http-status-codes';
import { getShippingCostsService } from '../services/shipping.service';

export { getShippingCostsController };

const getShippingCostsController = async function (req, res, next) {
    const shoppingCart = req.body;
    const userEmail = req.userEmail;

    let costs;
    try {
        costs = await getShippingCostsService(shoppingCart, userEmail);
    } catch (error) {
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        shippingCosts: costs,
    });
};
