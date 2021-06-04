import { Joi } from 'express-validation';

export { addReviewVal, editReviewVal };

const addReviewVal = {
    body: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        text: Joi.string().min(20).max(1000).required(),
    }),
};

const editReviewVal = {
    body: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        text: Joi.string().min(20).max(1000).required(),
    }),
};
