'use strict';

import express from 'express';
const routerPaypal = express.Router();

import { excHandler } from '../../utils/routeExceptionHandler';
import { checkAuthentication } from '../../middlewares';
import { parserJsonLimit } from '../../utils/bodyParsers';

import {
    createSignUpLinkController,
    createPaypalOrderController,
    capturePaypalOrderController,
} from './paypal-controller';

//Validation
import { cartProductValidation } from '../../validators/users_validators';

import { validate } from 'express-validation';

const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

routerPaypal.post(
    '/signup-link',
    parserJsonLimit,
    checkAuthentication,
    //validate(cartProductValidation, opts),
    excHandler(createSignUpLinkController)
);

routerPaypal.post(
    '/create-order',
    parserJsonLimit,
    checkAuthentication,
    //validate(cartProductValidation, opts),
    excHandler(createPaypalOrderController)
);

routerPaypal.post(
    '/capture-order',
    parserJsonLimit,
    checkAuthentication,
    //validate(cartProductValidation, opts),
    excHandler(capturePaypalOrderController)
);

export { routerPaypal };
