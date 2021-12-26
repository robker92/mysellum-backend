'use strict';
import express from 'express';
const routerShoppingCart = express.Router();

import excHandler from 'express-async-handler';
import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

//Validation
import {
    cartProductValidation,
    cartUpdateValidation,
} from '../utils/req-body-validators/shopping-cart-validators';
import { validate } from 'express-validation';
const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

import {
    addToShoppingCartController,
    removeFromShoppingCartController,
    updateShoppingCartController,
} from '../controllers/shopping-cart.controller';

const routerPrefix = 'cart';

routerShoppingCart.patch(
    `/${routerPrefix}/add/:email`,
    parserJsonLimit,
    checkAuthentication,
    validate(cartProductValidation, opts),
    excHandler(addToShoppingCartController)
);
routerShoppingCart.patch(
    `/${routerPrefix}/remove/:email`,
    parserJsonLimit,
    checkAuthentication,
    validate(cartProductValidation, opts),
    excHandler(removeFromShoppingCartController)
);
routerShoppingCart.patch(
    `/${routerPrefix}/update`,
    parserJsonLimit,
    checkAuthentication,
    // validate(cartUpdateValidation, opts),
    excHandler(updateShoppingCartController)
);

export { routerShoppingCart };
