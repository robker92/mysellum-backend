import { Joi } from 'express-validation';
import { joiProductSchema, joiMongoIdSchema } from '../../../utils/joiValidators';

export { productVal, stockAmountVal };

const stockAmountVal = {
    body: Joi.object({
        storeId: joiMongoIdSchema.optional(),
        _id: joiMongoIdSchema.optional(),
        stockAmount: Joi.number().integer().min(0).required(),
    }),
};

const productVal = {
    body: joiProductSchema(true).required(),
};
