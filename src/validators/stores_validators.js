//https://www.npmjs.com/package/express-validation
const {
    Joi
} = require('express-validation');

const addReviewVal = {
    body: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        text: Joi.string().min(10).max(1000).required()
    })
};

module.exports = {
    addReviewVal
};