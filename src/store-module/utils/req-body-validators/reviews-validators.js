import { Joi } from 'express-validation';

export { reviewVal };

const reviewVal = {
    body: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        text: Joi.string().min(20).max(2000).required(),
    }).required(),
};
