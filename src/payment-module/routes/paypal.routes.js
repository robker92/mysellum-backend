'use strict';

import express from 'express';
const routerPaypal = express.Router();

import { excHandler } from '../../utils/routeExceptionHandler';
import { checkAuthentication } from '../../middlewares';
import { parserJsonLimit } from '../../utils/bodyParsers';

import {
    createSignUpLinkController,
    onboardingDataController,
    // onboardingData2Controller,
    createPaypalOrderController,
    capturePaypalOrderController,
    fetchMerchantIdsController,
    // paypalOnboardingWebhookController,
    // paypalWebhookTestController,
} from '../controllers/paypal.controller';

// Validation
import {
    createSignUpLinkValidation,
    onboardingDataValidation,
    createPaypalOrderValidation,
    capturePaypalOrderValidation,
    fetchMerchantIdsValidation,
} from '../utils/validators/request-body-validators';
import { validate } from 'express-validation';

const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

const routerPrefix = 'paypal';

routerPaypal.post(
    `/${routerPrefix}/signup-link`,
    checkAuthentication,
    parserJsonLimit,
    validate(createSignUpLinkValidation, opts),
    excHandler(createSignUpLinkController)
);

routerPaypal.post(
    `/${routerPrefix}/create-order`,
    checkAuthentication,
    parserJsonLimit,
    validate(createPaypalOrderValidation, opts),
    excHandler(createPaypalOrderController)
);

routerPaypal.post(
    `/${routerPrefix}/capture-order`,
    checkAuthentication,
    parserJsonLimit,
    validate(capturePaypalOrderValidation, opts),
    excHandler(capturePaypalOrderController)
);

routerPaypal.post(
    `/${routerPrefix}/fetch-merchant-ids`,
    checkAuthentication,
    parserJsonLimit,
    validate(fetchMerchantIdsValidation, opts),
    excHandler(fetchMerchantIdsController)
);

// routerPaypal.get(
//     '/paypal-order',
//     parserJsonLimit,
//     checkAuthentication,
//     //validate(cartProductValidation, opts),
//     excHandler(getPaypalOrderController)
// );

// Paypal Webhook Merchant Onboarding Completed
// routerPaypal.post(
//     `/${routerPrefix}/onboarding-completed`,
//     parserJsonLimit,
//     //validate(cartProductValidation, opts),
//     excHandler(paypalOnboardingWebhookController)
// );

// // Paypal Webhook Test - All Events
// routerPaypal.post(
//     `/${routerPrefix}/webhook-test`,
//     parserJsonLimit,
//     //validate(cartProductValidation, opts),
//     excHandler(paypalWebhookTestController)
// );

routerPaypal.post(
    `/${routerPrefix}/onboarding-data/:storeId`,
    checkAuthentication,
    parserJsonLimit,
    validate(onboardingDataValidation, opts),
    excHandler(onboardingDataController)
);

// routerPaypal.post(
//     `/${routerPrefix}/onboarding-data2/:storeId`,
//     parserJsonLimit,
//     checkAuthentication,
//     validate(onboardingDataValidation, opts),
//     excHandler(onboardingData2Controller)
// );

export { routerPaypal };
