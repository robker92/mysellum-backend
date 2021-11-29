'use strict';
import express from 'express';
const routerAuthentication = express.Router();

import excHandler from 'express-async-handler';
// import { checkAuthentication } from '../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

//Validation
import {
    registerUserValidation,
    loginUserValidation,
    resendVerificationEmailValidation,
    sendPasswordResetMailValidation,
    resetPasswordValidation,
} from '../utils/req-body-validators/authentication-validators';

import { validate } from 'express-validation';

const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

import {
    loginUserController,
    registerUserController,
    resendVerificationEmailController,
    verifyRegistrationController,
    sendPasswordResetMailController,
    checkResetTokenController,
    resetPasswordController,
} from '../controllers/authentication.controller';

const routerPrefix = 'auth';

// Login, Register
routerAuthentication.post(
    `/${routerPrefix}/login-user`,
    parserJsonLimit,
    validate(loginUserValidation, opts),
    excHandler(loginUserController)
);
routerAuthentication.post(
    `/${routerPrefix}/register-user`,
    parserJsonLimit,
    validate(registerUserValidation, opts),
    excHandler(registerUserController)
);
routerAuthentication.post(
    `/${routerPrefix}/resend-verification-email`,
    parserJsonLimit,
    // validate(resendVerificationEmailValidation, opts),
    excHandler(resendVerificationEmailController)
);
routerAuthentication.post(
    `/${routerPrefix}/verify-registration/:verificationToken`,
    parserJsonLimit,
    excHandler(verifyRegistrationController)
);

// Password reset
routerAuthentication.post(
    `/${routerPrefix}/send-password-reset-mail`,
    parserJsonLimit,
    // validate(sendPasswordResetMailValidation, opts),
    excHandler(sendPasswordResetMailController)
);
routerAuthentication.get(
    `/${routerPrefix}/check-reset-token/:token`,
    excHandler(checkResetTokenController)
);
routerAuthentication.post(
    `/${routerPrefix}/reset-password/:token`,
    parserJsonLimit,
    // validate(resetPasswordValidation, opts),
    excHandler(resetPasswordController)
);

export { routerAuthentication };
