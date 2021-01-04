//https://www.npmjs.com/package/express-validation
const {
    Joi
} = require('express-validation');

const addReviewVal = {
    body: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        text: Joi.string().min(20).max(1000).required()
    })
};

const editReviewVal = {
    body: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        text: Joi.string().min(20).max(1000).required()
    })
};

const productVal = {
    body: Joi.object({
        storeId: Joi.string().optional(),
        productId: Joi.string().optional(),
        title: Joi.string().min(5).max(30).required(),
        description: Joi.string().min(20).max(200).required(),
        imgSrc: Joi.string().required(),
        price: Joi.string().required(),
        currency: Joi.string().required(),
        currencySymbol: Joi.string().required(),
        quantityType: Joi.string().required(),
        quantityValue: Joi.string().required(),
        stockAmount: Joi.number().integer().min(0).optional()
    })
};

const stockAmountVal = {
    body: Joi.object({
        storeId: Joi.string().optional(),
        productId: Joi.string().optional(),
        stockAmount: Joi.number().integer().min(0).required()
    })
};

const addStoreImageVal = {
    body: Joi.object({
        title: Joi.string().required(),
        imageSrc: Joi.string().required()
    })
};

const editStoreVal = {
    body: Joi.object({
        storeId: Joi.string().optional(),
        title: Joi.string().min(10).max(100).required(),
        description: Joi.string().min(100).max(10000).required(),
        tags: Joi.array().items(Joi.string()).required(),
        images: Joi.array().items(Joi.object({
            id: Joi.number().required(),
            title: Joi.string().required(),
            src: Joi.string().required()
        })).min(1).max(10).required(),
        address: Joi.object({
            addressLine1: Joi.string().required(),
            city: Joi.string().required(),
            postcode: Joi.string().required(),
            country: Joi.string().required()
        }),
        mapIcon: Joi.string().required(),
        location: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional(),
        }).optional()
    })
};

module.exports = {
    addReviewVal,
    editReviewVal,
    productVal,
    stockAmountVal,
    addStoreImageVal,
    editStoreVal
};