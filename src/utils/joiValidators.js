import { Joi } from 'express-validation';

export {
    joiProductSchema,
    joiShoppingCartSchema,
    joiAddressSchema,
    joiMongoIdSchema,
    joiTimeStringSchema,
    joiEmailSchema,
    joiBirthdate,
    joiPassword,
    joiRegisterUserSchema,
};

const joiMongoIdSchema = Joi.string()
    .regex(/^[A-Za-z0-9]*$/)
    .min(10)
    .max(30);

const joiEmailSchema = Joi.string().email();
const joiBirthdate = Joi.string().regex(/[0-9]{2}\.[0-9]{2}\.[0-9]{4}/);
const joiPassword = Joi.string()
    .min(8)
    .max(30)
    .regex(/(?=.*[$&+,:;=_?@#|'<>.^*()%!-])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/);

/**
 * joiProductSchema
 * @param {Boolean} complete defines if the product has to be complete. If false, only the IDs are required
 * @returns the schema
 */
function joiProductSchema(complete) {
    if (!complete) {
        return Joi.object({
            _id: joiMongoIdSchema.required(),
            storeId: joiMongoIdSchema.required(),
            title: Joi.string().min(5).max(30).optional(),
            description: Joi.string().min(20).max(200).optional(),
            longDescription: Joi.string().max(1000).optional(),
            imgSrc: Joi.string().optional(),
            imageDetails: Joi.object({
                size: Joi.number().min(0).optional(),
                name: Joi.string().min(1).max(100).optional(),
                originalname: Joi.string().min(1).max(100).optional(),
            }).optional(),
            price: Joi.string().min(1).max(50).optional(),
            priceFloat: Joi.number().optional(),
            currency: Joi.string().min(1).max(25).optional(),
            currencySymbol: Joi.string().min(1).max(10).optional(),
            quantityType: Joi.string().valid('Kilograms', 'Grams', 'Pieces').optional(),
            quantityValue: Joi.string().max(200).optional(),
            stockAmount: Joi.number().integer().min(0).optional(),
            datetimeCreated: Joi.string().max(200).allow(null, '').optional(),
            datetimeAdjusted: Joi.string().max(200).allow(null, '').optional(),
            delivery: Joi.boolean().optional(),
            pickup: Joi.boolean().optional(),
            active: Joi.boolean().optional(),
        });
    }
    return Joi.object({
        storeId: joiMongoIdSchema.optional(),
        _id: joiMongoIdSchema.optional(),
        title: Joi.string().min(5).max(30).required(),
        description: Joi.string().min(20).max(200).required(),
        longDescription: Joi.string().max(1000).optional(),
        imgSrc: Joi.string().min(1).required(),
        imageDetails: Joi.object({
            size: Joi.number().min(0).required(),
            name: Joi.string().min(1).max(100).required(),
            originalname: Joi.string().min(1).max(100).required(),
        }).required(),
        price: Joi.string().min(1).max(50).required(),
        priceFloat: Joi.number().optional(),
        currency: Joi.string().min(1).max(25).required(),
        currencySymbol: Joi.string().min(1).max(10).required(),
        quantityType: Joi.string().valid('Kilograms', 'Grams', 'Pieces').required(),
        quantityValue: Joi.string().max(200).required(),
        stockAmount: Joi.number().integer().min(0).optional(),
        datetimeCreated: Joi.string().max(200).allow(null, '').optional(),
        datetimeAdjusted: Joi.string().max(200).allow(null, '').optional(),
        delivery: Joi.boolean().required(),
        pickup: Joi.boolean().required(),
        active: Joi.boolean().required(),
    });
}

// const joiShoppingCartSchema = Joi.array().items(
//     Joi.array().items(joiProductSchema(false).required(), Joi.number().integer().required()).length(2).required()
// );

const joiShoppingCartSchema = Joi.array().items(
    Joi.array().items(joiProductSchema(false).required(), Joi.number().integer().required()).length(2).required()
);

/**
 * joiAddressSchema
 * @param {Boolean} includeNames
 * @returns the schema
 */
function joiAddressSchema(includeNames) {
    const address = Joi.object({
        addressLine1: Joi.string().min(3).max(50).required(),
        city: Joi.string()
            .min(3)
            .max(50)
            .regex(/[a-zA-Z]/)
            .required(),
        postcode: Joi.string().length(5).regex(/[0-9]/).required(),
        country: Joi.string().min(1).max(50).optional(), // TODO
    });
    if (includeNames) {
        return address.keys({
            firstName: Joi.string().min(3).max(50).required(),
            lastName: Joi.string().min(3).max(50).required(),
        });
    }
    return address;
}

const joiTimeStringSchema = Joi.string()
    .length(5)
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);

function joiRegisterUserSchema() {
    const address = joiAddressSchema(true);

    return address.keys({
        phoneNumber: Joi.string().min(5).max(30).required(),
        email: joiEmailSchema.required(),
        password: joiPassword.required(),
        birthdate: joiBirthdate.required(),
    });
}
