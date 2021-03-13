//https://www.npmjs.com/package/express-validation
//https://github.com/sideway/joi/blob/v13.1.2/API.md

import { Joi } from 'express-validation';

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
//TODO:
const productVal = {
    body: Joi.object({
        storeId: Joi.string().optional(),
        _id: Joi.string().optional(),
        title: Joi.string().min(5).max(30).required(),
        description: Joi.string().min(20).max(200).required(),
        imgSrc: Joi.string().required(),
        imageDetails: Joi.object().required(),
        price: Joi.string().required(),
        priceFloat: Joi.number().optional(),
        currency: Joi.string().required(),
        currencySymbol: Joi.string().required(),
        //check if in list
        quantityType: Joi.string().required(),
        quantityValue: Joi.string().required(),
        stockAmount: Joi.number().integer().min(0).optional(),
    }),
};

const stockAmountVal = {
    body: Joi.object({
        storeId: Joi.string().optional(),
        _id: Joi.string().optional(),
        stockAmount: Joi.number().integer().min(0).required(),
    }),
};

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

//===================================================================================================
export {
    addReviewVal,
    editReviewVal,
    productVal,
    stockAmountVal,
    editStoreVal,
    createStoreVal,
};
//===================================================================================================
