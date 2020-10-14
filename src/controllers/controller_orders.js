"use strict";
//App imports
const mongodb = require('../mongodb');
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
    var collection = await getMongoOrdersCollection();
    var data = req.body;

    var insertResult = await collection.insertOne(data);
    if (insertResult.result.ok == 1) {
        var user = insertResult.ops[0];
        console.log("Order creation successful!");
        console.log(user);
    } else {
        console.log("Order creation failed!");
        next("Order creation failed!");
    }

    res.status(200).json({
        success: true,
        message: 'Order creation successful!'
    });
};

module.exports = {
    getSingleOrder,
    getAllOrders,
    updateOrder,
    deleteOrder,
    createOrder
};