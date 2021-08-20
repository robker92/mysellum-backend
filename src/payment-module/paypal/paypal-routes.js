'use strict';

import express from 'express';
const routerPaypal = express.Router();

import { excHandler } from '../../utils/routeExceptionHandler';
import { checkAuthentication } from '../../middlewares';
import { parserJsonLimit } from '../../utils/bodyParsers';

import {
    createSignUpLinkController,
    onboardingDataController,
    onboardingData2Controller,
    createPaypalOrderController,
    capturePaypalOrderController,
    fetchMerchantIdsController,
    paypalOnboardingWebhookController,
    paypalWebhookTestController,
} from './paypal-controller';

//Validation
import {
    createSignUpLinkValidation,
    onboardingDataValidation,
    createPaypalOrderValidation,
    capturePaypalOrderValidation,
    fetchMerchantIdsValidation,
} from './validators/request-body-validators';
import { validate } from 'express-validation';

const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

routerPaypal.post(
    '/signup-link',
    parserJsonLimit,
    checkAuthentication,
    validate(createSignUpLinkValidation, opts),
    excHandler(createSignUpLinkController)
);

routerPaypal.post(
    '/create-order',
    parserJsonLimit,
    checkAuthentication,
    // validate(createPaypalOrderValidation, opts),
    excHandler(createPaypalOrderController)
);

routerPaypal.post(
    '/capture-order',
    parserJsonLimit,
    checkAuthentication,
    // validate(capturePaypalOrderValidation, opts),
    excHandler(capturePaypalOrderController)
);

routerPaypal.post(
    '/fetch-merchant-ids',
    parserJsonLimit,
    checkAuthentication,
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
routerPaypal.post(
    '/onboarding-completed',
    parserJsonLimit,
    //validate(cartProductValidation, opts),
    excHandler(paypalOnboardingWebhookController)
);

// Paypal Webhook Test - All Events
routerPaypal.post(
    '/webhook-test',
    parserJsonLimit,
    //validate(cartProductValidation, opts),
    excHandler(paypalWebhookTestController)
);

routerPaypal.post(
    '/onboarding-data/:storeId',
    parserJsonLimit,
    checkAuthentication,
    validate(onboardingDataValidation, opts),
    excHandler(onboardingDataController)
);

routerPaypal.post(
    '/onboarding-data2/:storeId',
    parserJsonLimit,
    checkAuthentication,
    validate(onboardingDataValidation, opts),
    excHandler(onboardingData2Controller)
);

export { routerPaypal };