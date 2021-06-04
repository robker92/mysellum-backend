import { Joi } from 'express-validation';

const customerContactVal = {
    body: Joi.object({
        email: Joi.string().email().min(5).max(50).required(),
        subject: Joi.string().min(5).max(100).required(),
        phoneNr: Joi.string().min(5).max(20).optional(),
        topic: Joi.string().optional(),
        message: Joi.string().min(20).max(2000).required(),
    }),
};

//===================================================================================================
export { customerContactVal };
//===================================================================================================
