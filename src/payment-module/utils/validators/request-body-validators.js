import { Joi } from 'express-validation';
import { joiShoppingCartSchema, joiAddressSchema, joiMongoIdSchema } from '../../../utils/joiValidators';

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
                        href: Joi.string().max(100).uri().required(),
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
        productIntentId: Joi.string().max(100).valid('addipmt'),
        productIntentID: Joi.string().max(100).valid('addipmt'),
        isEmailConfirmed: Joi.boolean().required(),
        accountStatus: Joi.string().max(100).valid('BUSINESS_ACCOUNT'),
    }),
};

const joiOrderSchema = Joi.object({
    products: joiShoppingCartSchema.required(),
    billingAddress: joiAddressSchema(true).required(),
    shippingAddress: joiAddressSchema(true).required(),
    currencyCode: Joi.string().min(1).max(100).required(),
    deliveryMethod: Joi.string().valid('delivery', 'pickup').required(),
});

const createPaypalOrderValidation = {
    body: joiOrderSchema.required(),
};

const capturePaypalOrderValidation = {
    body: Joi.object({
        orderData: joiOrderSchema.required(),
        orderId: joiMongoIdSchema.required(),
    }),
};

const fetchMerchantIdsValidation = {
    body: Joi.object({
        storeIds: Joi.array().items(joiMongoIdSchema.required()).required(),
    }),
};
