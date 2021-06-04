import { Joi } from 'express-validation';

export { productVal, stockAmountVal };

const stockAmountVal = {
    body: Joi.object({
        storeId: Joi.string().optional(),
        _id: Joi.string().optional(),
        stockAmount: Joi.number().integer().min(0).required(),
    }),
};

const productVal = {
    body: Joi.object({
        storeId: Joi.string().optional(),
        _id: Joi.string().optional(),
        title: Joi.string().min(5).max(30).required(),
        description: Joi.string().min(20).max(200).required(),
        imgSrc: Joi.string().required(),
        imageDetails: Joi.object().required(),
        price: Joi.string().required(),
        priceFloat: Joi.number().optional(),
        currency: Joi.string().required(),
        currencySymbol: Joi.string().required(),
        //check if in list
        quantityType: Joi.string().required(),
        quantityValue: Joi.string().required(),
        delivery: Joi.boolean().required(),
        pickup: Joi.boolean().required(),
        stockAmount: Joi.number().integer().min(0).optional(),
    }),
};
