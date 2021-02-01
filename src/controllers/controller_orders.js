"use strict";
//App imports
import {
    getMongoDBClient
} from '../mongodb/setup';

import {
    ObjectId
} from 'mongodb';

import {
    getMongoStoresCollection,
    getMongoOrdersCollection
} from '../mongodb/collections';

import {
    removeDuplicatesFromArray
} from '../utils/arrayFunctions';

import {
    sendNodemailerMail
} from '../mailing/nodemailer';


const getSingleOrder = async function (req, res, next) {
    let collection = await getMongoOrdersCollection();
    let id = req.params.id;

    let result = await collection.findOne({
        'id': id
    });
    //console.log(result);
    res.send(result);
};


const getStoresOrders = async function (req, res, next) {
    const collection = await getMongoOrdersCollection();
    const collectionStores = await getMongoStoresCollection();
    let storeId = req.params.storeId;
    let userEmail = req.userEmail;

    let findResult = await collectionStores.findOne({
        '_id': ObjectId(storeId)
    });

    if (!findResult) {
        return next({
            status: 400,
            message: "Store not found."
        });
    };
    //Guard to make sure that only the store owner is able to edit this store
    if (findResult.userEmail !== userEmail) {
        return next({
            status: 400,
            message: "User unauthorized to edit this store."
        });
    };

    let result = await collection.find({
        'storeId': storeId
    }).toArray();
    console.log(result);

    res.status(200).json({
        success: true,
        orders: result
    });
};

const getUsersOrders = async function (req, res, next) {
    let collection = await getMongoOrdersCollection();
    let userEmail = req.userEmail;
    //let storeId = req.params.storeId;

    let result = await collection.find({
        'userEmail': userEmail
    }).toArray();
    console.log(result);

    res.status(200).json({
        success: true,
        orders: result
    });
};

const getAllOrders = async function (req, res, next) {
    let collection = await getMongoOrdersCollection();

    let result = await collection.find().toArray();
    //console.log(result)
    res.status(200).send(result);
};

const updateOrder = async function (req, res, next) {
    //function for changing user data except password and email!
    let collection = await getMongoOrdersCollection();
    let id = req.params.id;
    let data = req.body; //json format

    //password routine
    // if (data['password']) {
    //     delete data['password'];
    // };
    // if (data['email']) {
    //     delete data['email'];
    // };

    let result = await collection.updateOne({
        //Selection criteria
        'id': id
    }, {
        //Updated data
        $set: data
    });

    res.status(200).json({
        success: true,
        message: 'Order successfully updated!',
        queryResult: result
    });
};

const deleteOrder = async function (req, res, next) {
    let collection = await getMongoOrdersCollection();
    let id = req.params.id;

    let result = await collection.remove({
        'id': id
    });

    res.status(200).json({
        success: true,
        message: 'Order successfully deleted!',
        queryResult: result
    });
};

const createOrder = async function (req, res, next) {
    const collectionOrders = await getMongoOrdersCollection();
    const collectionStores = await getMongoStoresCollection();
    const data = req.body;
    const products = req.body.products;

    let foundStoresPromiseArray = [];
    for (let i = 0; i < products.length; i++) {
        //Find stores with contained products in DB
        foundStoresPromiseArray[i] = collectionStores.findOne({
            "_id": ObjectId(products[i][0].storeId),
            "profileData.products.productId": products[i][0].productId
        });
    };
    //TODO single store id false?
    let foundStores;
    console.log(foundStores);
    try {
        foundStores = await Promise.all(foundStoresPromiseArray);
    } catch (error) {
        //Error while searching for stores
        return next({
            status: 400,
            message: "Wrong store Ids provided."
        });
    };
    //TODO remove store duplicates?
    removeDuplicatesFromArray(foundStores);
    onsole.log(foundStores);

    // console.log(foundStores)
    let productsOutOfStock = [];
    for (let i = 0; i < foundStores.length; i++) {
        //Get the ordered product from the store which was fetched from the db
        let orderedProductFromStore = foundStores[i].profileData.products.find(obj => {
            return obj.productId === products[i][0].productId
        });
        console.log(orderedProductFromStore)
        if (!orderedProductFromStore) {
            return next({
                status: 400,
                message: "Wrong product Id provided."
            });
        };
        //console.log(`ordered product: ${JSON.stringify(orderedProductFromStore)}`)
        //Check if the stock amount is bigger than the ordered amount
        if (orderedProductFromStore.stockAmount < products[i][1]) {
            productsOutOfStock.push(products[i][0]);
        };
    };

    //abort
    if (productsOutOfStock.length > 0) {
        return next({
            status: 500,
            success: false,
            message: "Products out of stock",
            productsOutOfStock: productsOutOfStock
        });
    };

    //TODO order data model

    //Start MongoDB transaction session
    const session = getMongoDBClient().startSession();

    try {
        await session.withTransaction(async () => {

            let updates = []
            for (let i = 0; i < products.length; i++) {
                //check if 
                updates[i] = collectionStores.findOneAndUpdate({
                    "_id": ObjectId(products[i][0].storeId),
                    "profileData.products.productId": products[i][0].productId
                }, {
                    $inc: {
                        "profileData.products.$.stockAmount": -products[i][1] //reduce stock amount by purchased amount
                    }
                }, {
                    upsert: false
                });
            };

            await Promise.all(updates);
            //TODO One order per store
            let orderCreation = await collectionOrders.insertOne(data);
            //console.log(orderCreation)
        }, mongodb.getTransactionWriteOptions());

    } catch (e) {
        console.log("The transaction was aborted due to an unexpected error: " + e);
        return next({
            status: 400,
            message: "Error while creating the order."
        });
    } finally {
        await session.endSession();
    };

    //Check and send the order creation notifications to the store owners
    for (let i = 0; i < foundStores.length; i++) {
        if(foundStores[i].notification.receivedOrder === true) {
            let mailOptions = {
                email: foundStores[i].userEmail,
                contentType: "orderCreation",
                orderData: {
                    id: orderCreation._id
                }
            };
            sendNodemailerMail(mailOptions);
        };
        //checkOrderCreationNotification(foundStores[i].notification, foundStores[i].userEmail, orderCreation._id)
    };
    //TODO Notification Product now out of stock or below defined limit
    res.status(200).json({
        success: true,
        message: 'Order creation successful!'
    });
};

//===================================================================================================
export { getSingleOrder, getStoresOrders, getUsersOrders, getAllOrders, updateOrder, deleteOrder, createOrder };
//===================================================================================================