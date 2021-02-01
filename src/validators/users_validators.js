//https://www.npmjs.com/package/express-validation
//https://github.com/sideway/joi/blob/v13.1.2/API.md

import {
    Joi
} from 'express-validation';

const registerUserValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
        //password: Joi.string().regex(/[a-zA-Z0-9]{8,30}/).required(),
        //at least 1 number, 1 lower, 1 upper and 1 special character
        password: Joi.string().min(8).max(30).regex(/(?=.*[$&+,:;=_?@#|'<>.^*()%!-])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/).required(),
        firstName: Joi.string().min(2).max(30).regex(/[a-zA-Z]/).required(),
        lastName: Joi.string().min(2).max(30).regex(/[a-zA-Z]/).required(),
        birthdate: Joi.string().regex(/[0-9]{2}\.[0-9]{2}\.[0-9]{4}/).required(),
        city: Joi.string().min(3).max(40).regex(/[a-zA-Z]/).required(),
        postcode: Joi.string().length(5).regex(/[0-9]/).required(),
        addressLine1: Joi.string().min(3).max(40).required()
    })
};

const loginUserValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(30).regex(/(?=.*[$&+,:;=_?@#|'<>.^*()%!-])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/).required()
    })
};

const cartProductValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
        product: Joi.object({
            productId: Joi.number().required(),
            storeId: Joi.string().regex(/^[A-Za-z0-9]*$/).required(),
            addDate: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            imgSrc: Joi.string().optional(),
            price: Joi.string().optional(),
            currency: Joi.string().optional(),
            currencySymbol: Joi.string().optional(),
            quantityType: Joi.string().optional(),
            quantityValue: Joi.string().optional(),
            stockAmount: Joi.optional(),
            datetimeCreated: Joi.string().allow(null, "").optional(),
            datetimeAdjusted: Joi.string().allow(null, "").optional(),
        }).required(),
        amount: Joi.number().required()
    })
};

const cartUpdateValidation = {
    body: Joi.object({
        shoppingCart: Joi.array().items(
            Joi.array().items(
                Joi.object({
                    productId: Joi.number().required(),
                    storeId: Joi.string().regex(/^[A-Za-z0-9]*$/).required(),
                    addDate: Joi.string().optional(),
                    title: Joi.string().optional(),
                    description: Joi.string().optional(),
                    imgSrc: Joi.string().optional(),
                    price: Joi.string().optional(),
                    currency: Joi.string().optional(),
                    currencySymbol: Joi.string().optional(),
                    quantityType: Joi.string().optional(),
                    quantityValue: Joi.string().optional(),
                    stockAmount: Joi.optional(),
                    datetimeCreated: Joi.string().allow(null, "").optional(),
                    datetimeAdjusted: Joi.string().allow(null, "").optional(),
                }).required(),
                Joi.number().required()
            )
        ),
    })
};

//===================================================================================================
export { registerUserValidation, loginUserValidation, cartProductValidation, cartUpdateValidation };
//===================================================================================================