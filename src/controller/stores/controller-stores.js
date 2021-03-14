'use strict';
import NodeGeocoder from 'node-geocoder';
const geoCodeOptions = {
    provider: 'openstreetmap',
};
const geoCoder = NodeGeocoder(geoCodeOptions);

import { ObjectId } from 'mongodb';

import {
    getMongoDBClient,
    getMongoDBTransactionWriteOptions,
} from '../../mongodb/setup';

import {
    getMongoStoresCollection,
    getMongoUsersCollection,
} from '../../mongodb/collections';

import { getStoreModel } from '../../data-models';

import { createSignUpLink } from '../../payment/paypal/paypal-rest-client';

import {
    checkProfileComplete,
    checkShippingRegistered,
    checkPaymentMethodRegistered,
} from '../../utils/checkActivation';

async function getMongoStoresCollection2() {
    return getMongoDBClient().db('testdatabase').collection('stores');
}

const getSingleStore = async function (req, res, next) {
    console.log(getMongoStoresCollection);
    let collection = await getMongoStoresCollection();
    //console.log(collection)
    //var id = new ObjectId(req.params.id);
    let result = await collection.findOne({
        _id: ObjectId(req.params.id),
    });
    if (!result) {
        return next({
            status: 400,
            message: 'Store not found.',
        });
    }
    console.log(result);
    //var result = await collection.findOne(ObjectId(req.params.id));
    //console.log(result);
    res.status(200).send(result);
};

const createStore = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    const collectionUsers = await getMongoUsersCollection();
    let data = req.body;
    let userEmail = req.userEmail;
    let fileArray = req.files;
    console.log(fileArray);

    //check if the user already owns a store
    let findResult = await collectionUsers.findOne({
        email: userEmail,
    });
    if (!findResult) {
        return next({
            status: 400,
            message: 'User not found.',
        });
    }
    console.log(findResult);
    console.log(findResult.ownedStoreId);
    if (findResult.ownedStoreId) {
        return next({
            status: 400,
            message: 'Creation unsuccessful. User already owns a store.',
        });
    }

    let addressString = `${data.address.addressLine1}, ${data.address.postcode} ${data.address.city}, ${data.address.country}`;
    console.log(addressString);

    let geoCodeResult;
    try {
        geoCodeResult = await geoCoder.geocode(addressString);
    } catch (error) {
        console.log(error);
        return next({
            status: 500,
            message: 'Error while geocoder.',
        });
    }
    //throw error when address was not found
    if (geoCodeResult.length === 0) {
        return next({
            status: 400,
            message: 'Invalid address provided.',
        });
    }

    //TODO validate the address, check if it exists, if it is in the correct country (legal) etc

    console.log(geoCodeResult[0]);
    let storeOptions = {
        userEmail: userEmail,
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
        description: data.description,
        tags: data.tags,
        images: data.images,
        products: [],
        reviews: [],
        avgRating: '0',
    };
    //Get the store data model
    let storeObject = getStoreModel(storeOptions);

    //add Ids to images
    for (let i = 0; i < storeObject.profileData.images.length; i++) {
        storeObject.profileData.images[i]['id'] = i;
    }

    // Start Mongo DB Transaction
    let insertResult;
    const session = getMongoDBClient().startSession();
    try {
        await session.withTransaction(async () => {
            //insert the store to the database
            insertResult = await collectionStores.insertOne(storeObject, {
                session,
            });
            let store = insertResult.ops[0];
            console.log('Store creation successful!');

            // Create paypal action link
            // Other option: use user email and not store id
            console.log(store._id);
            const paypalLinks = await createSignUpLink(
                `http://127.0.0.1:8080/en/store-profile/${store._id}`,
                store._id
            );
            const selfUrl = paypalLinks.links.find((obj) => obj.rel === 'self');
            const actionUrl = paypalLinks.links.find(
                (obj) => obj.rel === 'action_url'
            );
            await collectionStores.updateOne(
                {
                    _id: ObjectId(store._id),
                },
                {
                    $set: {
                        'payment.paypal.urls.self': selfUrl,
                        'payment.paypal.urls.actionUrl': actionUrl,
                    },
                },
                { session }
            );
            // Write Store Id to user
            await collectionUsers.updateOne(
                {
                    email: userEmail,
                },
                {
                    $set: {
                        ownedStoreId: store._id,
                    },
                },
                { session }
            );
        }, getMongoDBTransactionWriteOptions());
    } catch (e) {
        console.log(
            'The transaction was aborted due to an unexpected error: ' + e
        );
        return next({
            status: 400,
            message: 'Error while creating the store.',
        });
    } finally {
        await session.endSession();
    }

    // } else {
    //     console.log('Store creation failed!');
    //     return next({
    //         status: 400,
    //         message: 'Store creation failed!',
    //     });
    // }

    res.status(200).json({
        success: true,
        message: 'Store creation successful!',
        queryResult: insertResult,
    });
};

const editStore = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    let data = req.body;
    let storeId = req.params.storeId;
    let userEmail = req.userEmail;

    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });

    if (!findResult) {
        return next({
            status: 400,
            message: 'Store not found.',
        });
    }
    //Guard to make sure that only the store owner is able to edit this store
    if (findResult.userEmail !== userEmail) {
        return next({
            status: 400,
            message: 'User unauthorized to edit this store.',
        });
    }

    //let storeData = storeModel.get(options);

    let addressString = `${data.address.addressLine1}, ${data.address.postcode} ${data.address.city}, ${data.address.country}`;
    let geoCodeResult = await geoCoder.geocode(addressString);

    const activationProfileCompleteValue = checkProfileComplete(
        data.title,
        data.description,
        data.tags,
        data.images
    );
    const activationShippingValue = checkShippingRegistered();
    const activationPaymentMethodValue = checkPaymentMethodRegistered();

    let updateResult = await collectionStores.updateOne(
        {
            _id: ObjectId(storeId),
        },
        {
            $set: {
                'profileData.title': data.title,
                'profileData.description': data.description,
                'profileData.tags': data.tags,
                'profileData.images': data.images,
                'mapData.address.addressLine1': data.address.addressLine1,
                'mapData.address.city': data.address.city,
                'mapData.address.postcode': data.address.postcode,
                'mapData.address.country': data.address.country,
                'mapData.mapIcon': data.mapIcon,
                'mapData.location.lat': geoCodeResult[0].latitude,
                'mapData.location.lng': geoCodeResult[0].longitude,
                'activationSteps.profileComplete': activationProfileCompleteValue,
                'activationSteps.shippingRegistered': activationShippingValue,
                'activationSteps.paymentMethodRegistered': activationPaymentMethodValue,
            },
        }
    );

    res.status(200).json({
        success: true,
        message: 'Store update successful!',
        //queryResult: updateResult
    });
};

const deleteStore = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    const collectionUsers = await getMongoUsersCollection();
    let userEmail = req.userEmail;
    let storeId = req.params.storeId;

    //Get the store to retrieve user email
    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });
    if (!findResult) {
        return next({
            status: 400,
            message: 'Store not found.',
        });
    }
    console.log(findResult);
    //Guard to make sure that only the store owner is able to edit this store
    if (findResult.userEmail !== userEmail) {
        return next({
            status: 400,
            message: 'User unauthorized to delete this store.',
        });
    }

    //Delete Store
    let deleteStoreResult = await collectionStores.deleteOne({
        _id: ObjectId(storeId),
    });

    //Set ownedStoreId at Owner to ""
    let updateUserResult = await collectionUsers.updateOne(
        {
            email: userEmail,
        },
        {
            $set: {
                ownedStoreId: '',
            },
        }
    );

    res.status(200).json({
        success: true,
        message: 'Store successfully deleted!',
    });
};

//===================================================================================================
export { getSingleStore, createStore, editStore, deleteStore };
//===================================================================================================
