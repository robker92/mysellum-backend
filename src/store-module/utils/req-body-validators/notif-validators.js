import { Joi } from 'express-validation';
import { joiMongoIdSchema } from '../../../utils/joiValidators';

const registerProductAvailabilityNotificationVal = {
    body: Joi.object({
        email: Joi.string().email().max(500).required(),
        storeId: joiMongoIdSchema.required(),
        productId: joiMongoIdSchema.required(),
    }).required(),
};

//===================================================================================================
export { registerProductAvailabilityNotificationVal };
//===================================================================================================
