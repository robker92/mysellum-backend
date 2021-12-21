'use strict';
// database operations
import {
    readOneOperation,
    updateOneOperation,
    updateOneAndReturnOperation,
    readManyOperation,
    deleteOneOperation,
    deleteManyOperation,
    createOneOperation,
    databaseEntity,
} from '../../storage/database-operations';

import { FRONTEND_BASE_URL_PROD } from '../../config';

// MongoDB transaction
import {
    getMongoDbClient,
    getMongoDbTransactionWriteOptions,
} from '../../storage/mongodb/setup';
import { ObjectId } from 'mongodb';

import NodeGeocoder from 'node-geocoder';
const geoCodeOptions = {
    provider: 'openstreetmap',
};
const geoCoder = NodeGeocoder(geoCodeOptions);

import { getStoreModel } from '../../data-models';
import { createSignUpLink } from '../../payment-module/paypal/rest/paypal-rest-client';
import {
    uploadBlobService,
    deleteBlobService,
    getImageBufferResizedService,
    getImageBase64Resized,
} from './images.service';
import { storeActivationRoutine } from '../services/activation.service';

import sanitizeHtml from 'sanitize-html';

import {
    fetchAndValidateStore,
    validateStoreOwner,
} from '../utils/operations/store-checks';
import moment from 'moment-timezone';

export {
    getSingleStoreService,
    createStoreService,
    editStoreService,
    deleteStoreService,
    setStoreDistributionValue,
    updateStoreDistributionValues,
    adminActivationService,
    adminDeactivationService,
};

/**
 *
 * @param {string} storeId
 * @param {string} userEmail
 * @returns
 */
async function getSingleStoreService(storeId, userEmail) {
    // const store = await fetchAndValidateStore(storeId);
    // const store = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }

    const store = await readOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {}
    );

    if (!store) {
        throw new Error(`Store with the id ${storeId} not found.`);
    }
    console.log(userEmail);
    console.log(store.userEmail);
    // check if store owner is requesting his own store
    if (userEmail === store.userEmail) {
        // if yes, the store is returned
        return store;
    }

    if (!store.adminActivation) {
        throw new Error(
            `Store with the id ${storeId} is not activated by the admins.`
        );
    }

    if (store.deleted) {
        throw new Error(`Store with the id ${storeId} has been deleted.`);
    }

    if (!store.activation) {
        throw new Error(`Store with the id ${storeId} is not activated yet.`);
    }

    console.log(store.profileData.images);
    return store;
}

/**
 *
 * @param {object} data
 * @param {string} userEmail
 * @returns
 */
async function createStoreService(data, userEmail) {
    const findResult = await readOneOperation(databaseEntity.USERS, {
        email: userEmail,
    });
    if (!findResult) {
        throw new Error(`User with the email ${userEmail} not found.`);
    }
    if (findResult.ownedStoreId) {
        throw new Error(`User already owns a store.`);
    }

    const addressString = `${data.address.addressLine1}, ${data.address.postcode} ${data.address.city}, ${data.address.country}`;
    console.log(addressString);

    let geoCodeResult = await geoCoder.geocode(addressString);
    // throw error when address was not found
    if (geoCodeResult.length === 0) {
        throw new Error(`Invalid address provided.`);
    }

    // IMAGES - if image is base64 string, upload image to blob store and replace base64 string with blob url
    for (const image of data.images) {
        // const file = {
        //     buffer: image.src,
        //     size: image.size,
        //     name: image.name,
        //     originalName: image.originalName,
        // };

        // Resize file
        const resizedImage = await getImageBase64Resized(file.buffer);
        // file.buffer = resizedImage.base64String;

        const resizedFile = {
            buffer: resizedImage.base64String,
            size: resizedImage.metadata.size,
            name: image.name,
            originalName: image.originalName,
        };

        image.src = await uploadBlobService(resizedFile);
        image.size = resizedFile.size;
        console.log(image);
    }

    // TODO validate the address, check if it exists, if it is in the correct country (legal) etc

    // sanitize the description
    const sanitizedDescription = sanitizeHtml(data.description);

    console.log(geoCodeResult[0]);
    let storeOptions = {
        userEmail: userEmail,
        // Both (delivery and pickup) are false initially. They will be set when products are added.
        delivery: false,
        pickup: false,
        datetimeCreated: new Date().toISOString(),
        datetimeAdjusted: '',
        addressLine1: data.address.addressLine1,
        postcode: data.address.postcode,
        city: data.address.city,
        country: data.address.country,
        mapImg: data.mapImg,
        lat: geoCodeResult[0].latitude,
        lng: geoCodeResult[0].longitude,
        mapIcon: data.mapIcon,
        title: data.title,
        subtitle: data.subtitle,
        description: sanitizedDescription,
        tags: data.tags,
        images: data.images,
        products: [],
        reviews: [],
        avgRating: '0',
    };
    // Get the store data model
    const storeObject = getStoreModel(storeOptions);

    // Add Ids to images
    for (let i = 0; i < storeObject.profileData.images.length; i++) {
        storeObject.profileData.images[i]['id'] = i;
    }

    // Start Mongo DB Transaction
    let store;
    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            // insert the store to the database
            const insertResult = await createOneOperation(
                databaseEntity.STORES,
                storeObject,
                session
            );

            store = insertResult.ops[0];
            console.log('Store creation successful!');

            // Create paypal action link
            // Other option: use user email and not store id
            console.log(store._id);
            const paypalLinks = await createSignUpLink(
                // `https://prjct-frontend.azurewebsites.net/store-profile/${store._id}`,
                `${FRONTEND_BASE_URL_PROD}/store-profile/${store._id}`,
                // `http://127.0.0.1:8080/store-profile/${store._id}`,
                // '/',
                store._id
            );
            const selfUrl = paypalLinks.links.find((obj) => obj.rel === 'self');
            const actionUrl = paypalLinks.links.find(
                (obj) => obj.rel === 'action_url'
            );

            await updateOneOperation(
                databaseEntity.STORES,
                {
                    //Selection criteria
                    _id: store._id,
                },
                {
                    'payment.paypal.urls.self': selfUrl,
                    'payment.paypal.urls.actionUrl': actionUrl,
                },
                'set',
                session
            );
            await updateOneOperation(
                databaseEntity.USERS,
                {
                    email: userEmail,
                },
                {
                    ownedStoreId: ObjectId(store._id),
                },
                'set',
                session
            );

            await storeActivationRoutine(store, session);
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
    }
    return store;
}

/**
 *
 * @param {object} data
 * @param {string} storeId
 * @param {string} userEmail
 * @returns
 */
async function editStoreService(data, storeId, userEmail) {
    // console.log(data);
    const store = await fetchAndValidateStore(storeId);
    validateStoreOwner(userEmail, store.userEmail);

    // sanitize the description
    const sanitizedDescription = sanitizeHtml(data.description);

    // const findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }
    // //Guard to make sure that only the store owner is able to edit this store
    // if (findResult.userEmail !== userEmail) {
    //     throw new Error(
    //         `User with the email address ${userEmail} unauthorized to edit this store.`
    //     );
    // }

    //let storeData = storeModel.get(options);
    const addressString = `${data.address.addressLine1}, ${data.address.postcode} ${data.address.city}, ${data.address.country}`;
    console.log(addressString);
    const geoCodeResult = await geoCoder.geocode(addressString);
    // throw error when address was not found
    if (geoCodeResult.length === 0) {
        throw new Error(
            `Invalid address provided (${JSON.stringify(data.address)}).`
        );
    }

    // IMAGES - if image is base64 string, upload image to blob store and replace base64 string with blob url
    for (const image of data.images) {
        if (image.src.startsWith('data:image/')) {
            // Resize file
            const resizedImage = await getImageBase64Resized(image.src);

            const resizedFile = {
                buffer: resizedImage.base64String,
                size: resizedImage.metadata.size,
                name: image.name,
                originalName: image.originalName,
            };

            image.src = await uploadBlobService(resizedFile);
            image.size = resizedFile.size;
            console.log(image);
        }
        if (
            image.src.startsWith('https://') &&
            image.src.includes('.blob.core.windows.net/')
        ) {
            console.log(`Image already uploaded.`);
        }
    }
    // console.log(JSON.stringify(data.images));

    // Iterate over old images and see if the url is in the array of new images. If not, delete the blob
    let promises = [];
    let found;
    for (const oldImage of store.profileData.images) {
        found = false;
        for (const newImage of data.images) {
            // if old image is found, set var to true
            if (oldImage.src === newImage.src) {
                found = true;
                break;
            }
        }
        if (found === false) {
            // Delete Blob
            const blobName = oldImage.src.substring(
                oldImage.src.lastIndexOf('/') + 1,
                oldImage.src.length
            );
            console.log(`Old Image: ${blobName}`);
            promises.push(deleteBlobService(blobName));
        }
    }
    // do not abort when the deletion is unsuccessful
    try {
        await Promise.all(promises);
    } catch (error) {
        console.log(error);
    }

    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            await storeActivationRoutine(store, session);

            const openingHours = validateOpeningHours(data.openingHours);
            // console.log(data.contact);
            await updateOneOperation(
                databaseEntity.STORES,
                {
                    _id: storeId,
                },
                {
                    'profileData.title': data.title,
                    'profileData.description': sanitizedDescription,
                    'profileData.tags': data.tags,
                    'profileData.images': data.images,
                    'mapData.address.addressLine1': data.address.addressLine1,
                    'mapData.address.city': data.address.city,
                    'mapData.address.postcode': data.address.postcode,
                    'mapData.address.country': data.address.country,
                    'mapData.mapIcon': data.mapIcon,
                    'mapData.location.lat': geoCodeResult[0].latitude,
                    'mapData.location.lng': geoCodeResult[0].longitude,
                    'shipping.method': data.shippingMethod,
                    'shipping.costs': data.shippingCosts,
                    'shipping.thresholdValue': data.shippingThresholdValue,
                    openingHours: openingHours,
                    contact: data.contact,
                    // 'activationSteps.profileComplete': activationProfileCompleteValue,
                    // 'activationSteps.shippingRegistered': activationShippingValue,
                    // 'activationSteps.paymentMethodRegistered':
                    //     activationPaymentMethodValue,
                },
                'set',
                session
            );
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
    }

    return;
}

function validateOpeningHours(openingHours) {
    // deep copy the original object
    let returnObject = JSON.parse(JSON.stringify(openingHours));

    // get weekday array
    const days = Object.keys(openingHours);

    // iterate over day keys
    for (const day of days) {
        // current day object
        const currentDay = openingHours[day];
        // validate open time
        if (
            !currentDay.times.open ||
            !validateTimeFormat(currentDay.times.open)
        ) {
            returnObject[day].opened = false;
            returnObject[day].times.open = '00:00';
        }
        // validate close time
        if (
            !currentDay.times.close ||
            !validateTimeFormat(currentDay.times.close)
        ) {
            returnObject[day].close = false;
            returnObject[day].times.close = '00:00';
        }
        // validate if open is before close time
        if (
            !validateOpenBeforeCloseTime(
                currentDay.times.open,
                currentDay.times.close
            ) &&
            currentDay.times.open !== '00:00' &&
            currentDay.times.close !== '00:00'
        ) {
            returnObject[day].close = false;
            returnObject[day].times.open = '00:00';
            returnObject[day].times.close = '00:00';
        }
    }
    console.log(returnObject);
    return returnObject;
}

function validateTimeFormat(time) {
    return moment(time, 'HH:mm', true).isValid();
}
function validateOpenBeforeCloseTime(open, close) {
    const openTime = moment(open, 'HH:mm', true);
    const closeTime = moment(close, 'HH:mm', true);

    return openTime.isBefore(closeTime);
}

/**
 *
 * @param {string} storeId
 * @param {string} userEmail
 * @returns
 */
async function deleteStoreService(storeId, userEmail) {
    const store = await fetchAndValidateStore(storeId);
    validateStoreOwner(userEmail, store.userEmail);
    // const findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }
    // //Guard to make sure that only the store owner is able to edit this store
    // if (findResult.userEmail !== userEmail) {
    //     throw new Error(
    //         `User with the email address ${userEmail} unauthorized to edit this store.`
    //     );
    // }

    const session = getMongoDBClient().startSession();
    try {
        await session.withTransaction(async () => {
            await updateOneOperation(
                databaseEntity.STORES,
                {
                    _id: storeId,
                },
                {
                    deleted: true,
                },
                'set',
                session
            );

            await updateOneOperation(
                databaseEntity.USERS,
                {
                    email: userEmail,
                },
                {
                    ownedStoreId: '',
                },
                'set',
                session
            );
        }, getMongoDbTransactionWriteOptions());
    } catch (e) {
        console.log(
            'The transaction was aborted due to an unexpected error: ' + e
        );
        throw e;
    } finally {
        await session.endSession();
    }

    return;
}

/**
 * This function sets a boolean value for a provided distribution type to as store. It is called when
 * @param {string} storeId
 * @param {string} type "delivery" or "pickup"
 * @param {boolean} value true or false
 * @param {string} session mongo db session if needed
 */
async function setStoreDistributionValue(storeId, type, value, session = null) {
    let setObj = {};
    setObj[type] = value;

    if (!session) {
        await updateOneOperation(
            databaseEntity.STORES,
            {
                _id: storeId,
            },
            setObj,
            'set'
        );
    } else {
        await updateOneOperation(
            databaseEntity.STORES,
            {
                _id: storeId,
            },
            setObj,
            'set',
            session
        );
    }

    return;
}

/**
 * The function sets a store's values for the two distribution types
 * @param {string} storeId
 * @param {string} session mongo db session if needed
 */
async function updateStoreDistributionValues(storeId, session = null) {
    // get the store and it's current values
    const store = await readOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {},
        session
    );
    const currentDeliveryValue = store.delivery;
    const currentPickupValue = store.pickup;

    // get the store's products
    const products = await readManyOperation(
        databaseEntity.PRODUCTS,
        {
            storeId: storeId,
        },
        { imgSrc: 0 },
        {},
        session
    );

    // baseline: values are false
    let productsDeliveryValue = false;
    let productsPickupValue = false;
    // the products are iterated and when a distribution type is true, we set the value accordingly
    for (const product of products) {
        if (product.delivery === true) {
            productsDeliveryValue = true;
        }
        if (product.pickup === true) {
            productsPickupValue = true;
        }

        // when both values are true, we break out of the for loop
        if (productsDeliveryValue === true && productsPickupValue === true) {
            break;
        }
    }

    // set identified values
    if (currentDeliveryValue !== productsDeliveryValue) {
        await setStoreDistributionValue(
            storeId,
            'delivery',
            productsDeliveryValue,
            session
        );
    }

    if (currentPickupValue !== productsPickupValue) {
        await setStoreDistributionValue(
            storeId,
            'pickup',
            productsPickupValue,
            session
        );
    }

    return;
}

/**
 * The function performs the admin activation action
 * @param {string} storeId
 */
async function adminActivationService(storeId) {
    await updateOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {
            adminActivation: true,
        },
        'set'
    );

    return;
}

/**
 * The function performs the admin activation action
 * @param {string} storeId
 */
async function adminDeactivationService(storeId) {
    await updateOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {
            adminActivation: false,
        },
        'set'
    );

    return;
}
