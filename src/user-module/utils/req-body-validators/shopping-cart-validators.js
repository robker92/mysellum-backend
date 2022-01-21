//https://www.npmjs.com/package/express-validation
//https://github.com/sideway/joi/blob/v13.1.2/API.md

import { Joi } from 'express-validation';
import { joiShoppingCartSchema } from '../../../utils/joiValidators';

export { cartProductValidation, cartUpdateValidation };

const cartProductValidation = {
    body: joiShoppingCartSchema.required(),
};

const cartUpdateValidation = {
    body: Joi.object({
        shoppingCart: joiShoppingCartSchema.required(),
    }).required(),
};
