//https://www.npmjs.com/package/express-validation
//https://github.com/sideway/joi/blob/v13.1.2/API.md

import { Joi } from 'express-validation';

export { editStoreVal, createStoreVal };

// const addStoreImageVal = {
//     body: Joi.object({
//         title: Joi.string().required(),
//         imageSrc: Joi.string().required()
//     })
// };

const editStoreVal = {
    body: Joi.object({
        storeId: Joi.string().optional(),
        title: Joi.string().min(10).max(100).required(),
        subtitle: Joi.string().allow(null, '').min(0).max(150).optional(),
        description: Joi.string().min(100).max(10000).required(),
        tags: Joi.array().items(Joi.string()).min(1).max(10).required(),
        images: Joi.array()
            .items(
                Joi.object({
                    id: Joi.number().required(),
                    title: Joi.string().required(),
                    size: Joi.number().optional(),
                    src: Joi.string().required(),
                })
            )
            .min(1)
            .max(10)
            .required(),
        address: Joi.object({
            addressLine1: Joi.string().min(3).max(40).required(),
            city: Joi.string()
                .min(3)
                .max(40)
                .regex(/[a-zA-Z]/)
                .required(),
            postcode: Joi.string().length(5).regex(/[0-9]/).required(),
            country: Joi.string().min(3).max(40).required(),
        }),
        //check if in list
        mapIcon: Joi.string().required(),
        location: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional(),
        }).optional(),
    }),
};

const createStoreVal = {
    body: Joi.object({
        userEmail: Joi.string().email().optional(),
        title: Joi.string().min(10).max(100).required(),
        subtitle: Joi.string().allow(null, '').min(0).max(150).optional(),
        description: Joi.string().min(100).max(10000).required(),
        tags: Joi.array().items(Joi.string()).min(1).max(10).required(),
        images: Joi.array()
            .items(
                Joi.object({
                    id: Joi.number().required(),
                    title: Joi.string().required(),
                    size: Joi.number().optional(),
                    src: Joi.string().required(),
                })
            )
            .min(1)
            .max(10)
            .required(),
        address: Joi.object({
            addressLine1: Joi.string().min(3).max(40).required(),
            city: Joi.string()
                .min(3)
                .max(40)
                .regex(/[a-zA-Z]/)
                .required(),
            postcode: Joi.string().length(5).regex(/[0-9]/).required(),
            country: Joi.string().min(3).max(40).required(),
        }),
        //TODO check if in list
        mapIcon: Joi.string().required(),
        location: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional(),
        }).optional(),
    }),
};
