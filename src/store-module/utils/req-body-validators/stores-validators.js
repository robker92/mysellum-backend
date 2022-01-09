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
        storeId: Joi.string().max(200).optional(),
        title: Joi.string().min(10).max(100).required(),
        subtitle: Joi.string().allow(null, '').min(0).max(150).optional(),
        description: Joi.string().min(100).max(10000).required(),
        tags: Joi.array().items(Joi.string().max(100).required()).min(1).max(10).required(),
        images: Joi.array()
            .items(
                Joi.object({
                    id: Joi.number().required(),
                    title: Joi.string().max(200).required(),
                    size: Joi.number().optional(),
                    src: Joi.string().max(1000).required(),
                    name: Joi.string().max(100).optional(),
                    originalName: Joi.string().max(100).optional(),
                })
            )
            .min(1)
            .max(10)
            .required(),
        address: Joi.object({
            addressLine1: Joi.string().min(3).max(40).required(),
            city: Joi.string()
                .min(2)
                .max(40)
                .regex(/[a-zA-Z]/)
                .required(),
            postcode: Joi.string().length(5).regex(/[0-9]/).required(),
            country: Joi.string().min(2).max(40).required(),
        }).required(),

        // LEGAL
        // Formula for base 64 String length to bytes
        // (3 * (LengthInCharacters / 4)) - (numberOfPaddingCharacters) = length in bytes
        // (1 000 002 / 3) * 4 = LengthInCharacters -> 1 500 000 chars for 1MB
        // https://blog.aaronlenoir.com/2017/11/10/get-original-length-from-base-64-string/
        legalDocuments: Joi.array()
            .items(
                Joi.object({
                    type: Joi.string().min(3).max(40).required(),
                    label: Joi.string().min(3).max(40).required(),
                    fileDetails: Joi.object({
                        lastModified: Joi.string().required(),
                        lastModifiedDate: Joi.string().optional(),
                        name: Joi.string().min(3).max(40).required(),
                        size: Joi.number().required(),
                        type: Joi.string().min(3).max(40).required(),
                        webkitRelativePath: Joi.string().min(3).max(40).optional(),
                    }).required(),
                    fileSrc: Joi.string().min(10).max(1500000).required(),
                })
            )
            .optional(),

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
        shippingMethod: Joi.string().valid('free', 'fixed', 'threshold').required(),
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
        tags: Joi.array().items(Joi.string().max(25).required()).min(1).max(10).required(),
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
        shippingMethod: Joi.string().valid('free', 'fixed', 'threshold').optional(),
        shippingCosts: Joi.number().optional(),
        shippingThresholdValue: Joi.number().optional(),
    }),
};
