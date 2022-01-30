//https://www.npmjs.com/package/express-validation
//https://github.com/sideway/joi/blob/v13.1.2/API.md

import { Joi } from 'express-validation';
import { joiShoppingCartSchema, joiProductSchema } from '../../../utils/joiValidators';

export { cartProductValidation, cartUpdateValidation };

const cartProductValidation = {
    body: Joi.object({
        product: joiProductSchema(false).required(),
        amount: Joi.number().integer().required(),
    }).required(),
};

const cartUpdateValidation = {
    body: Joi.object({
        shoppingCart: joiShoppingCartSchema.required(),
    }).required(),
};
