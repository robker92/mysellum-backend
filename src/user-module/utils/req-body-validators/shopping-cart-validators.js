//https://www.npmjs.com/package/express-validation
//https://github.com/sideway/joi/blob/v13.1.2/API.md

import { Joi } from 'express-validation';

export { cartProductValidation, cartUpdateValidation };

const cartProductValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
        product: Joi.object({
            _id: Joi.string().required(),
            productId: Joi.number().optional(),
            storeId: Joi.string()
                .regex(/^[A-Za-z0-9]*$/)
                .required(),
            addDate: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            longDescription: Joi.string().optional(),
            imgSrc: Joi.string().optional(),
            imageDetails: Joi.object().optional(),
            price: Joi.string().optional(),
            priceFloat: Joi.number().optional(),
            currency: Joi.string().optional(),
            currencySymbol: Joi.string().optional(),
            quantityType: Joi.string().optional(),
            quantityValue: Joi.string().optional(),
            stockAmount: Joi.optional(),
            delivery: Joi.boolean().optional(),
            pickup: Joi.boolean().optional(),
            active: Joi.boolean().optional(),
            datetimeCreated: Joi.string().allow(null, '').optional(),
            datetimeAdjusted: Joi.string().allow(null, '').optional(),
        }).required(),
        amount: Joi.number().required(),
    }),
};

const cartUpdateValidation = {
    body: Joi.object({
        shoppingCart: Joi.array()
            .items(
                Joi.array()
                    .items(
                        Joi.object({
                            _id: Joi.string().required(),
                            productId: Joi.number().optional(),
                            storeId: Joi.string()
                                .regex(/^[A-Za-z0-9]*$/)
                                .required(),
                            addDate: Joi.string().optional(),
                            title: Joi.string().optional(),
                            description: Joi.string().optional(),
                            imgSrc: Joi.string().optional(),
                            imageDetails: Joi.object().optional(),
                            price: Joi.string().optional(),
                            priceFloat: Joi.number().optional(),
                            currency: Joi.string().optional(),
                            currencySymbol: Joi.string().optional(),
                            quantityType: Joi.string().optional(),
                            quantityValue: Joi.string().optional(),
                            stockAmount: Joi.optional(),
                            delivery: Joi.boolean().optional(),
                            pickup: Joi.boolean().optional(),
                            datetimeCreated: Joi.string()
                                .allow(null, '')
                                .optional(),
                            datetimeAdjusted: Joi.string()
                                .allow(null, '')
                                .optional(),
                        }).required(),
                        Joi.number().required()
                    )
                    .optional()
            )
            .optional(),
    }),
};
