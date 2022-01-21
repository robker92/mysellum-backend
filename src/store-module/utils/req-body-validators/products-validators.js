import { Joi } from 'express-validation';
import { joiProductSchema, joiMongoIdSchema, joiProductStockAmount } from '../../../utils/joiValidators';

export { createProductVal, stockAmountVal, editProductVal };

const stockAmountVal = {
    body: Joi.object({
        stockAmount: joiProductStockAmount.required(),
    }).required(),
};

const createProductVal = {
    body: joiProductSchema(true).required(),
};

const editProductVal = {
    body: joiProductSchema(true)
        .keys({
            _id: joiMongoIdSchema.required(),
        })
        .required(),
};
