'use strict';

// Packages
import express from 'express';
const routerShipping = express.Router();
import excHandler from 'express-async-handler';
import { validate } from 'express-validation';

// Controllers
import { getShippingCostsController } from '../controllers/shipping.controller';

// Utils
import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

// Validation
// import {
//     addReviewVal,
//     editReviewVal,
// } from '../utils/req-body-validators/reviews-validators.js';
// const opts = {
//     keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
// };

const routerPrefix = 'shipping';

// Routes
routerShipping.post(
    `/${routerPrefix}/get-costs`,
    parserJsonLimit,
    // checkAuthentication,
    // validate(addReviewVal, opts),
    excHandler(getShippingCostsController)
);

export { routerShipping };
