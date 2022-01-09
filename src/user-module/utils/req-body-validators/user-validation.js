import { Joi } from 'express-validation';

export { updateUserDataValidation };

const updateUserDataValidation = {
    body: Joi.object({
        phoneNumber: Joi.string().min(5).max(30).required(),
        email: Joi.string().email().max(100).required(),
        // firstName: Joi.string()
        //     .min(2)
        //     .max(30)
        //     .regex(/[a-zA-Z]/)
        //     .required(),
        // lastName: Joi.string()
        //     .min(2)
        //     .max(30)
        //     .regex(/[a-zA-Z]/)
        //     .required(),
        city: Joi.string()
            .min(3)
            .max(100)
            .regex(/[a-zA-Z]/)
            .required(),
        postcode: Joi.string().length(5).regex(/[0-9]/).required(),
        addressLine1: Joi.string().min(3).max(100).required(),
        country: Joi.string().min(3).max(30).optional(),
    }),
};
