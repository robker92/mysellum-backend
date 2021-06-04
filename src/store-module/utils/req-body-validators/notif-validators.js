import { Joi } from 'express-validation';

const registerProductAvailabilityNotificationVal = {
    body: Joi.object({
        email: Joi.string().email().required(),
        storeId: Joi.string().min(10).max(100).required(),
        productId: Joi.string().min(10).max(100).required(),
    }),
};

//===================================================================================================
export { registerProductAvailabilityNotificationVal };
//===================================================================================================
