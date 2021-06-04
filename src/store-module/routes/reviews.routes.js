'use strict';

// Packages
import express from 'express';
const routerReviews = express.Router();
import excHandler from 'express-async-handler';
import { validate } from 'express-validation';

// Controllers
import {
    addReviewController,
    editReviewController,
    deleteReviewController,
} from '../controllers/reviews.controller';

// Utils
import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

// Validation
import {
    addReviewVal,
    editReviewVal,
} from '../utils/req-body-validators/reviews-validators.js';
const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

const routerPrefix = 'stores';

// Routes
routerReviews.post(
    `/${routerPrefix}/:storeId/reviews`,
    parserJsonLimit,
    checkAuthentication,
    validate(addReviewVal, opts),
    excHandler(addReviewController)
);

routerReviews.patch(
    `/${routerPrefix}/:storeId/reviews/:reviewId`,
    parserJsonLimit,
    checkAuthentication,
    validate(editReviewVal, opts),
    excHandler(editReviewController)
);

routerReviews.delete(
    `/${routerPrefix}/:storeId/reviews/:reviewId`,
    checkAuthentication,
    excHandler(deleteReviewController)
);

export { routerReviews };
