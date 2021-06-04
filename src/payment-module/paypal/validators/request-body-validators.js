import { Joi } from 'express-validation';

//===================================================================================================
export {
    createSignUpLinkValidation,
    createPaypalOrderValidation,
    capturePaypalOrderValidation,
    fetchMerchantIdsValidation,
};
//===================================================================================================

const createSignUpLinkValidation = {
    body: Joi.object({
        returnLink: Joi.string().max(10000).required(),
        trackingId: Joi.string().max(10000).required(),
    }),
};

const createPaypalOrderValidation = {
    body: Joi.object({
        products: Joi.array().items(
            Joi.array().items(
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
                    datetimeCreated: Joi.string().allow(null, '').optional(),
                    datetimeAdjusted: Joi.string().allow(null, '').optional(),
                }).required(),
                Joi.number().required()
            )
        ),
        billingAddress: Joi.object({
            firstName: Joi.string().min(3).max(50).required(),
            lastName: Joi.string().min(3).max(50).required(),
            addressLine1: Joi.string().min(3).max(50).required(),
            city: Joi.string()
                .min(3)
                .max(40)
                .regex(/[a-zA-Z]/)
                .required(),
            postcode: Joi.string().length(5).regex(/[0-9]/).required(),
            country: Joi.string().min(1).max(50).required(),
        }),
        shippingAddress: Joi.object({
            firstName: Joi.string().min(3).max(50).required(),
            lastName: Joi.string().min(3).max(50).required(),
            addressLine1: Joi.string().min(3).max(50).required(),
            city: Joi.string()
                .min(3)
                .max(40)
                .regex(/[a-zA-Z]/)
                .required(),
            postcode: Joi.string().length(5).regex(/[0-9]/).required(),
            country: Joi.string().min(1).max(50).required(),
        }),
        currencyCode: Joi.string().min(1).max(100).required(),
    }),
};

const capturePaypalOrderValidation = {
    body: Joi.object({
        orderData: Joi.object({
            products: Joi.array().items(
                Joi.array().items(
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
                        datetimeCreated: Joi.string()
                            .allow(null, '')
                            .optional(),
                        datetimeAdjusted: Joi.string()
                            .allow(null, '')
                            .optional(),
                    }).required(),
                    Joi.number().required()
                )
            ),
            billingAddress: Joi.object({
                firstName: Joi.string().min(3).max(50).required(),
                lastName: Joi.string().min(3).max(50).required(),
                addressLine1: Joi.string().min(3).max(50).required(),
                city: Joi.string()
                    .min(3)
                    .max(40)
                    .regex(/[a-zA-Z]/)
                    .required(),
                postcode: Joi.string().length(5).regex(/[0-9]/).required(),
                country: Joi.string().min(1).max(50).required(),
            }),
            shippingAddress: Joi.object({
                firstName: Joi.string().min(3).max(50).required(),
                lastName: Joi.string().min(3).max(50).required(),
                addressLine1: Joi.string().min(3).max(50).required(),
                city: Joi.string()
                    .min(3)
                    .max(40)
                    .regex(/[a-zA-Z]/)
                    .required(),
                postcode: Joi.string().length(5).regex(/[0-9]/).required(),
                country: Joi.string().min(1).max(50).required(),
            }),
            currencyCode: Joi.string().min(1).max(100).required(),
        }),
        orderId: Joi.string().min(3).max(50).required(),
    }),
};

const fetchMerchantIdsValidation2 = {
    body: Joi.object({
        shoppingCart: Joi.array().items(
            Joi.array().items(
                Joi.object({
                    _id: Joi.string().required(),
                    productId: Joi.number().optional(),
                    storeId: Joi.string()
                        .regex(/^[A-Za-z0-9]*$/)
                        .required(),
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
                    datetimeCreated: Joi.string().allow(null, '').optional(),
                    datetimeAdjusted: Joi.string().allow(null, '').optional(),
                }).required(),
                Joi.number().optional()
            )
        ),
    }),
};

const fetchMerchantIdsValidation = {
    body: Joi.object({
        storeIds: Joi.array()
            .items(
                Joi.string()
                    .regex(/^[A-Za-z0-9]*$/)
                    .required()
            )
            .required(),
    }),
};
