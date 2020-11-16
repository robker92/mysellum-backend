const {
    Joi
} = require('express-validation');

const registerUserValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
        //password: Joi.string().regex(/[a-zA-Z0-9]{8,30}/).required(),
        //at least 1 number, 1 lower, 1 upper and 1 special character + length >= 8
        password: Joi.string().regex(/(?=.*[$&+,:;=_?@#|'<>.^*()%!-])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){8,30}/).required(),
        firstName: Joi.string().regex(/[a-zA-Z]{2,30}/).required(),
        lastName: Joi.string().regex(/[a-zA-Z]{2,30}/).required(),
        birthDate: Joi.string().regex(/[0-9]{2}\.[0-9]{2}\.[0-9]{4}/).required(),
        city: Joi.string().required(),
        postcode: Joi.string().regex(/[0-9]{5}/).required(),
        addressLine1: Joi.string().required()
    })
};

module.exports = {
    registerUserValidation
};