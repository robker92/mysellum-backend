"use strict";
//App imports
const mongodb = require('../mongodb');
const ObjectId = require('mongodb').ObjectId;
const config = require('../config');

/*
Data Model
Order: {
    id
    userId
    storeId
    totalSum
    shippingAddress
    products

}
*/

async function getMongoOrdersCollection() {
    return mongodb.getClient().db(config.mongodb_name).collection("orders");
};
async function getMongoStoresCollection() {
    return mongodb.getClient().db(config.mongodb_name).collection("stores");
};

const getSingleOrder = async function (req, res, next) {
    var collection = await getMongoOrdersCollection();
    var id = req.params.id;

    var result = await collection.findOne({
        'id': id
    });
    //console.log(result);
    res.send(result);
};

const getAllOrders = async function (req, res, next) {
    var collection = await getMongoOrdersCollection();

    var result = await collection.find().toArray();
    //console.log(result)
    res.status(200).send(result);
};

const updateOrder = async function (req, res, next) {
    //function for changing user data except password and email!
    var collection = await getMongoOrdersCollection();
    var id = req.params.id;
    var data = req.body; //json format

    //password routine
    // if (data['password']) {
    //     delete data['password'];
    // };
    // if (data['email']) {
    //     delete data['email'];
    // };

    var result = await collection.updateOne({
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
    var collection = await getMongoOrdersCollection();
    var id = req.params.id;

    var result = await collection.remove({
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

    let foundStores = [];
    for (let i = 0; i < products.length; i++) {
        //Find stores with contained products in DB
        foundStores[i] = collectionStores.findOne({
            "_id": ObjectId(products[i][0].storeId),
            "profileData.products.productId": products[i][0].productId
        });
    };

    Promise.all(foundStores)
        .then((foundStores) => {
            // console.log(foundStores)
            let productsOutOfStock = [];
            for (let i = 0; i < foundStores.length; i++) {
                //Get the ordered product from the store which was fetched from the db
                let orderedProductFromStore = foundStores[i].profileData.products.find(obj => {
                    return obj.productId === products[i][0].productId
                });
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
                })
            };

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

            Promise.all(updates)
                .then(async () => {
                    let orderCreation = await collectionOrders.insertOne(data);
                    res.status(200).json({
                        success: true,
                        message: 'Order creation successful!'
                    });
                })
                .catch((error) => {
                    console.log(error)
                });

        })
        .catch((error) => {
            console.log(error)
        });
    // var insertResult = await collectionOrders.insertOne(data);
    // if (insertResult.result.ok == 1) {
    //     var user = insertResult.ops[0].user;
    //     console.log("Order creation successful!");
    //     console.log(user);
    // } else {
    //     console.log("Order creation failed!");
    //     next("Order creation failed!");
    // }


};

module.exports = {
    getSingleOrder,
    getAllOrders,
    updateOrder,
    deleteOrder,
    createOrder
};