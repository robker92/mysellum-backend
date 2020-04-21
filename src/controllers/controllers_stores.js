"use strict";
//App imports
const mongodb = require('../mongodb');
const config = require('../config');

/*
Data Model
Store: {
    id
    userId
    address
    coordinates
    description
    images [{}]
}
*/

async function getMongoStoresCollection() {
    return mongodb.getClient().db(config.mongodb_name).collection("stores");
};

const getSingleStore = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var id = req.params.id;

    var result = await collection.findOne({
        'id': id
    });
    //console.log(result);
    res.send(result);
};

const getAllStores = async function (req, res, next) {
    var collection = await getMongoStoresCollection();

    var result = await collection.find().toArray();
    //console.log(result)
    res.status(200).send(result);
};

const updateStore = async function (req, res, next) {
    //function for changing user data except password and email!
    var collection = await getMongoStoresCollection();
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
        message: 'Store successfully updated!',
        queryResult: result
    });
};

const deleteStore = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var id = req.params.id;

    var result = await collection.remove({
        'id': id
    });

    res.status(200).json({
        success: true,
        message: 'Store successfully deleted!',
        queryResult: result
    });
};

const createStore = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var data = req.body;

    var insertResult = await collection.insertOne(data);
    if (insertResult.result.ok == 1) {
        var user = insertResult.ops[0];
        console.log("Store creation successfull!");
        console.log(user);
    } else {
        console.log("Store creation failed!");
        next("Store creation failed!");
    }

    res.status(200).json({
        success: true,
        message: 'Store creation successful!'
    });
};

module.exports = {
    getSingleStore,
    getAllStore,
    updateStore,
    deleteStore,
    createStore
};