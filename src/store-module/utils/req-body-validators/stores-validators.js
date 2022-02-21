//https://www.npmjs.com/package/express-validation
//https://github.com/sideway/joi/blob/v13.1.2/API.md

import { Joi } from 'express-validation';
import { joiAddressSchema, joiMongoIdSchema, joiTimeStringSchema } from '../../../utils/joiValidators';

export { editStoreVal, createStoreVal };

const joiTitle = Joi.string().min(10).max(100);
const joiSubtitle = Joi.string().allow(null, '').min(0).max(150);
const joiDescription = Joi.string().min(100).max(10000);
const joiTags = Joi.array().items(Joi.string().max(100).required()).min(1).max(10);
const joiMapIcon = Joi.string().min(1).max(100);
const joiLocation = Joi.object({
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
});
const joiShippingMethod = Joi.string().valid('free', 'fixed', 'threshold');
const joiShippingCosts = Joi.number();
const joiShippingThresholdValue = Joi.number();
const joiShippingCostsCurrency = Joi.string().min(1).max(20);
const joiShippingCostsCurrencySymbol = Joi.string().min(1).max(3);

const joiStoreImages = Joi.array()
    .items(
        Joi.object({
            id: Joi.number().required(),
            title: Joi.string().max(200).required(),
            size: Joi.number().optional(),
            src: Joi.string().required(),
            name: Joi.string().max(100).optional(),
            originalName: Joi.string().max(100).optional(),
        })
    )
    .min(1)
    .max(10);

const editStoreVal = {
    body: Joi.object({
        storeId: joiMongoIdSchema.optional(),
        title: joiTitle.required(),
        subtitle: joiSubtitle.optional(),
        description: joiDescription.required(),
        tags: joiTags.required(),
        images: joiStoreImages.required(),
        address: joiAddressSchema(false).required(),

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
                        lastModified: Joi.number().required(),
                        lastModifiedDate: Joi.string().max(50).optional(),
                        name: Joi.string().min(3).max(100).required(),
                        size: Joi.number().required(),
                        type: Joi.string().min(3).max(50).required(),
                        webkitRelativePath: Joi.string().min(3).max(50).optional(),
                    }).required(),
                    fileSrc: Joi.string().min(10).max(1500000).required(),
                })
            )
            .optional(),

        //check if in list
        mapIcon: Joi.string().min(1).max(100).required(),
        location: joiLocation.optional(),
        contact: Joi.object({
            phoneNumber: Joi.string().regex(/[0-9]/).min(5).max(25).optional(),
            emailAddress: Joi.string().email().min(5).max(100).optional(),
            website: Joi.string().min(5).max(250).optional(),
        }).optional(),
        shippingMethod: joiShippingMethod.required(),
        shippingCosts: joiShippingCosts.required(),
        shippingCostsCurrency: joiShippingCostsCurrency.optional(),
        shippingCostsCurrencySymbol: joiShippingCostsCurrencySymbol.optional(),
        shippingThresholdValue: joiShippingThresholdValue.required(),
        openingHours: Joi.object({
            monday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: joiTimeStringSchema.required(),
                    close: joiTimeStringSchema.required(),
                }),
            }).required(),
            tuesday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: joiTimeStringSchema.required(),
                    close: joiTimeStringSchema.required(),
                }),
            }).required(),
            wednesday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: joiTimeStringSchema.required(),
                    close: joiTimeStringSchema.required(),
                }),
            }).required(),
            thursday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: joiTimeStringSchema.required(),
                    close: joiTimeStringSchema.required(),
                }),
            }).required(),
            friday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: joiTimeStringSchema.required(),
                    close: joiTimeStringSchema.required(),
                }),
            }).required(),
            saturday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: joiTimeStringSchema.required(),
                    close: joiTimeStringSchema.required(),
                }),
            }).required(),
            sunday: Joi.object({
                opened: Joi.boolean().required(),
                times: Joi.object({
                    open: joiTimeStringSchema.required(),
                    close: joiTimeStringSchema.required(),
                }),
            }).required(),
        }).optional(),
        hasOpened: Joi.boolean().optional(),
    }).required(),
};

const createStoreVal = {
    body: Joi.object({
        title: joiTitle.required(),
        subtitle: joiSubtitle.optional(),
        description: joiDescription.required(),
        tags: joiTags.required(),
        images: joiStoreImages.required(),
        address: joiAddressSchema(false).required(),

        // TODO check if in list
        mapIcon: joiMapIcon.required(),
    }).required(),
};
