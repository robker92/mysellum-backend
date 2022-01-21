//https://www.npmjs.com/package/express-validation
//https://github.com/sideway/joi/blob/v13.1.2/API.md

import { Joi } from 'express-validation';
import { joiEmailSchema, joiBirthdate, joiPassword, joiRegisterUserSchema } from '../../../utils/joiValidators';

export {
    registerUserValidation,
    loginUserValidation,
    resendVerificationEmailValidation,
    sendPasswordResetMailValidation,
    resetPasswordValidation,
};

const registerUserValidation = {
    body: joiRegisterUserSchema().required(),
};

const loginUserValidation = {
    body: Joi.object({
        email: joiEmailSchema.required(),
        password: joiPassword.required(),
    }).required(),
};

const resendVerificationEmailValidation = {
    body: Joi.object({
        email: joiEmailSchema.required(),
        birthdate: joiBirthdate.required(),
    }).required(),
};

const sendPasswordResetMailValidation = {
    body: Joi.object({
        email: joiEmailSchema.required(),
        birthdate: joiBirthdate.required(),
    }).required(),
};

const resetPasswordValidation = {
    body: Joi.object({
        password: joiPassword.required(),
    }).required(),
};
