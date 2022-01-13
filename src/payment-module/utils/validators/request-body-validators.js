import { Joi } from 'express-validation';

//===================================================================================================
export {
    createSignUpLinkValidation,
    setOrderStatusValidation,
    onboardingCompletedWebhookValidation,
    onboardingDataValidation,
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

const setOrderStatusValidation = {
    body: Joi.object({
        storeId: Joi.string().min(5).max(100).required(),
        orderId: Joi.string().min(5).max(100).required(),
        step: Joi.string().valid('orderReceived', 'paymentReceived', 'inDelivery').required(), // orderReceived, paymentReceived, inDelivery
        value: Joi.boolean().required(),
        type: Joi.string().valid('delivery', 'pickup').required(), // delivery or pickup
    }),
};

const onboardingCompletedWebhookValidation = {
    body: Joi.object({
        id: Joi.string()
            .regex(/^([A-Za-z0-9\-]+)*$/)
            .max(100)
            .required(),
        create_time: Joi.date().iso().required(),
        resource_type: Joi.string().valid('merchant-onboarding').required(),
        event_type: Joi.string().valid('"MERCHANT.ONBOARDING.COMPLETED"').required(),
        resource: Joi.object({
            partner_client_id: Joi.string()
                .regex(/^([A-Za-z0-9\-]+)*$/)
                .max(100)
                .required(),
            links: Joi.array()
                .items(
                    Joi.object({
                        href: Joi.string().uri().required(),
                        rel: Joi.string().valid('self').required(),
                        method: Joi.string().valid('GET').required(),
                        description: Joi.string().max(250).required(),
                    }).required()
                )
                .required(),
            merchant_id: Joi.string().max(100).required(),
        }),
        links: Joi.array().length(0).optional(),
    }),
};

const onboardingDataValidation = {
    body: Joi.object({
        merchantId: Joi.string()
            .regex(/^[A-Za-z0-9]*$/)
            .length(24)
            .required(),
        merchantIdInPayPal: Joi.string()
            .regex(/^[A-Za-z0-9]*$/)
            .length(13)
            .required(),
        permissionsGranted: Joi.boolean().required(),
        consentStatus: Joi.boolean().required(),
        productIntentId: Joi.string().valid('addipmt'),
        productIntentID: Joi.string().valid('addipmt'),
        isEmailConfirmed: Joi.boolean().required(),
        accountStatus: Joi.string().valid('BUSINESS_ACCOUNT'),
    }),
};

const createPaypalOrderValidation = {
    body: Joi.object({
        products: Joi.array()
            .items(
                Joi.array()
                    .items(
                        Joi.object({
                            _id: Joi.string().required(),
                            storeId: Joi.string()
                                .regex(/^[A-Za-z0-9]*$/)
                                .required(),
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
                            datetimeCreated: Joi.string().allow(null, '').optional(),
                            datetimeAdjusted: Joi.string().allow(null, '').optional(),
                            active: Joi.boolean().optional(),
                            pickup: Joi.boolean().optional(),
                            delivery: Joi.boolean().optional(),
                        }).required(),
                        Joi.number().required()
                    )
                    .length(2)
                    .required()
            )
            .required(),
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
        }).required(),
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
        }).required(),
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
                        storeId: Joi.string()
                            .regex(/^[A-Za-z0-9]*$/)
                            .required(),
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
                        datetimeCreated: Joi.string().allow(null, '').optional(),
                        datetimeAdjusted: Joi.string().allow(null, '').optional(),
                        active: Joi.boolean().optional(),
                        pickup: Joi.boolean().optional(),
                        delivery: Joi.boolean().optional(),
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

// const fetchMerchantIdsValidation2 = {
//     body: Joi.object({
//         shoppingCart: Joi.array().items(
//             Joi.array().items(
//                 Joi.object({
//                     _id: Joi.string().required(),
//                     productId: Joi.number().optional(),
//                     storeId: Joi.string()
//                         .regex(/^[A-Za-z0-9]*$/)
//                         .required(),
//                     title: Joi.string().optional(),
//                     description: Joi.string().optional(),
//                     imgSrc: Joi.string().optional(),
//                     imageDetails: Joi.object().optional(),
//                     price: Joi.string().optional(),
//                     priceFloat: Joi.number().optional(),
//                     currency: Joi.string().optional(),
//                     currencySymbol: Joi.string().optional(),
//                     quantityType: Joi.string().optional(),
//                     quantityValue: Joi.string().optional(),
//                     stockAmount: Joi.optional(),
//                     delivery: Joi.boolean().optional(),
//                     pickup: Joi.boolean().optional(),
//                     datetimeCreated: Joi.string().allow(null, '').optional(),
//                     datetimeAdjusted: Joi.string().allow(null, '').optional(),
//                 }).required(),
//                 Joi.number().optional()
//             )
//         ),
//     }),
// };

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
