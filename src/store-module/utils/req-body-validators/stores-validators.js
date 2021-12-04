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
                    name: Joi.string().optional(),
                    originalName: Joi.string().optional(),
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
        contact: Joi.object({
            phoneNumber: Joi.string().regex(/[0-9]/).min(5).max(25).optional(),
            emailAddress: Joi.string().email().min(5).max(100).optional(),
            website: Joi.string().min(5).max(250).optional(),
        }).optional(),
        shippingMethod: Joi.string()
            .valid('free', 'fixed', 'threshold')
            .required(),
        shippingCosts: Joi.number().required(),
        shippingThresholdValue: Joi.number().required(),
        openingHours: Joi.object({
            monday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                    close: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                }),
            }).required(),
            tuesday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                    close: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                }),
            }).required(),
            wednesday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                    close: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                }),
            }).required(),
            thursday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                    close: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                }),
            }).required(),
            friday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                    close: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                }),
            }).required(),
            saturday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                    close: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                }),
            }).required(),
            sunday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                    close: Joi.string()
                        .length(5)
                        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
                        .required(),
                }),
            }).required(),
        }).required(),
        hasOpened: Joi.boolean().optional(),
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
        shippingMethod: Joi.string()
            .valid('free', 'fixed', 'threshold')
            .optional(),
        shippingCosts: Joi.number().optional(),
        shippingThresholdValue: Joi.number().optional(),
    }),
};
