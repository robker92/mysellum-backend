"use strict";
//App imports
const mongodb = require('../mongodb');
const config = require('../config');
var ObjectId = require('mongodb').ObjectId;
//var coll = mongodb.getClient().db(config.mongodb_name).collection("stores");

/*
Data Model
Store: {
    _id,
    mapData: {
        img,
        location:{lat,lng},
        offerings,
        subtitle,
        title
    }
    profileData: {
        title,
        description,
        avgRating,
        images: [{
            src,
            title
        }],
        products:[{
            currency,
            currencySymbol,
            description,
            id,
            imgSrc,
            price,
            title
        }],
        reviews: [{
            user,
            date,
            rating,
            text
        }]
    }
}
*/


async function getMongoStoresCollection() {
    return mongodb.getClient().db(config.mongodb_name).collection("stores");
};
// Get the MongoDB users collection
async function getMongoUsersCollection() {
    return mongodb.getClient().db(config.mongodb_name).collection("users");
}

const getSingleStore = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    //var id = new ObjectId(req.params.id);
    var result = await collection.findOne({
        '_id': ObjectId(req.params.id)
    });
    //var result = await collection.findOne(ObjectId(req.params.id));
    //console.log(result);
    res.send(result);
};

const getAllStores = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var result = await collection.find().toArray();
    //console.log(result)
    //res.status(200).send(result);
    res.status(200).json({
        success: true,
        message: 'All stores successfully fetched!',
        stores: result
    });
};

const getFilteredStores = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var searchTerm = req.params.searchterm;
    //var idArray = [];
    //var result = await collection.find().toArray();
    //db.stores.find({"profileData.tags":{$eq: "meat"}})
    var result = await collection.find({
        "profileData.tags": {
            $eq: searchTerm
        }
    }).toArray();
    console.log(result)

    // for (var i = 0; i < result.length; i++) {
    //     idArray.push(result[i]._id.toString())
    // }
    // console.log(idArray)
    //console.log(result)
    //res.status(200).send(result);
    res.status(200).json({
        success: true,
        message: 'Filtered stores successfully fetched!',
        stores: result,
        //idArray: idArray
    });
};

const getFilteredStores2 = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    console.log(req.body)
    var filterObject = req.body;
    console.log(filterObject)
    //Create filter query (like here https://docs.mongodb.com/manual/tutorial/query-arrays/)
    var queryFilter = {};
    for (let key in filterObject) {
        if (key == "tags") {
            if (filterObject[key].length > 0) {
                queryFilter[`profileData.${key}`] = {
                    $all: filterObject[key]
                }
            } else {

            }
        }
    }
    console.log(queryFilter)

    //Fetch filtered Stores
    var result = await collection.find(queryFilter).toArray();

    res.status(200).json({
        success: true,
        message: 'Filtered stores successfully fetched!',
        stores: result,
        //idArray: idArray
    });
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
        'id': ObjectId(id)
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
    var storeId = req.params.storeId;

    var result = await collection.remove({
        '_id': ObjectId(storeId)
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

    var storeObject = {
        "userEmail": data.userEmail,
        "mapData": {
            "address": data.address,
            "img": data.mapImg,
            "location": {
                "lat": parseFloat(data.lat),
                "lng": parseFloat(data.lng)
            }
        },
        "profileData": {
            "title": data.title,
            "subtitle": data.subtitle,
            "description": data.description,
            "tags": data.tags,
            "images": data.images,
            "products": [],
            "reviews": [],
            "avgRating": "0",

        }
    };
    //add Ids to images -> Refactor with multiple images are there
    for (var i = 0; i < storeObject.profileData.images.length; i++) {
        storeObject.profileData.images[i]["id"] = i;
    };

    var insertResult = await collection.insertOne(storeObject);
    if (insertResult.result.ok == 1) {
        var store = insertResult.ops[0];
        console.log("Store creation successfull!");
        console.log(store);

        //Write Store Id to user
        await getMongoUsersCollection.updateOne({
            email: data.userEmail
        }, {
            $set: {
                "ownedStoreId": store._id
            }
        })
    } else {
        console.log("Store creation failed!");
        next("Store creation failed!");
    }

    res.status(200).json({
        success: true,
        message: 'Store creation successful!',
        queryResult: insertResult
    });
};

const editStore = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var data = req.body;
    var storeId = req.params.storeId;
    console.log(storeId)
    console.log(data.address)
    console.log(data.location)
    var updateResult = await collection.updateOne({
        _id: ObjectId(storeId)
    }, {
        $set: {
            "profileData.title": data.title,
            "profileData.description": data.description,
            "profileData.tags": data.tags,
            "profileData.images": data.images,
            "mapData.address.addressLine1": data.address.addressLine1,
            "mapData.address.city": data.address.city,
            "mapData.address.postcode": data.address.postcode,
            "mapData.location.lat": parseFloat(data.location.lat),
            "mapData.location.lng": parseFloat(data.location.lng)
        }
    });

    res.status(200).json({
        success: true,
        message: 'Store update successful!',
        queryResult: updateResult
    });
};

const addStoreImage = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var data = req.body;
    var storeId = req.params.storeId;

    var findResult = await collection.findOne({
        '_id': ObjectId(storeId)
    });

    var imageData = {
        "id": findResult.profileData.images.length.toString(),
        "src": data.imageSrc,
        "title": data.title
    };
    var updateResult = await collection.updateOne({
        _id: ObjectId(storeId)
    }, {
        $push: {
            'profileData.images': imageData
        }
    });

    res.status(200).json({
        success: true,
        message: 'Successfully added store image!',
        result: updateResult,
        imageData: imageData
    });
};

const deleteStoreImage = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var data = req.body;
    var storeId = req.params.storeId;
    var imageId = req.params.imageId;
    console.log(storeId)
    console.log(imageId)
    console.log(data)
    // var imageData = {
    //     imageSrc: data.imageSrc,
    //     title: data.title
    // }
    var updateResult = await collection.updateOne({
        _id: ObjectId(storeId)
    }, {
        $pull: {
            'profileData.images': {
                id: imageId,
                src: data.imageSrc,
                title: data.title
            }
        }
    }, {
        multi: true
    });
    console.log(updateResult.result)
    res.status(200).json({
        success: true,
        message: 'Successfully deleted store image!',
        result: updateResult
    });
};

const addProduct = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var data = req.body;
    console.log(data)
    var findResult = await collection.findOne({
        '_id': ObjectId(data.storeId)
    });

    //Define product id
    if (findResult.profileData.products.length == 0) {
        var productId = 0;
    } else {
        var productId = parseInt(findResult.profileData.products[findResult.profileData.products.length - 1].productId) + 1;
    }

    // findResult.profileData.products.push({
    //     "productId": productId.toString(),
    //     "addDate": new Date(),
    //     "title": data.title,
    //     "description": data.description,
    //     "imgSrc": data.imgSrc,
    //     "price": data.price,
    //     "currency": data.currency,
    //     "currencySymbol": data.currencySymbol
    // });

    var newProduct = {
        "productId": productId.toString(),
        "storeId": data.storeId,
        "addDate": new Date(),
        "title": data.title,
        "description": data.description,
        "imgSrc": data.imgSrc,
        "price": data.price,
        "currency": data.currency,
        "currencySymbol": data.currencySymbol,
        "quantityType": data.quantityType,
        "quantityValue": data.quantityValue
    }
    // var updateResult = await collection.updateOne({
    //     //Selection criteria
    //     '_id': ObjectId(data.storeId)
    // }, {
    //     //Updated data
    //     $set: findResult
    // });

    var updateResult = await collection.updateOne({
        _id: ObjectId(data.storeId)
    }, {
        $push: {
            'profileData.products': newProduct
        }
    });

    // findResult = await collection.findOne({
    //     '_id': ObjectId(data.storeId)
    // });

    res.status(200).json({
        success: true,
        message: 'Successfully added product!',
        result: updateResult,
        product: newProduct
    });
};

const editProduct = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var data = req.body;
    var storeId = req.params.storeId;
    var productId = req.params.productId;

    var findResult = await collection.findOne({
        '_id': ObjectId(storeId)
    });

    var index = findResult.profileData.products.findIndex(rv => rv.productId === productId);
    findResult.profileData.products[index].title = data.title;
    findResult.profileData.products[index].description = data.description;
    findResult.profileData.products[index].price = data.price;
    findResult.profileData.products[index].imgSrc = data.imgSrc;
    findResult.profileData.products[index].quantityType = data.quantityType;
    findResult.profileData.products[index].quantityValue = data.quantityValue;
    findResult.profileData.products[index].datetimeAdjusted = data.datetime;
    //findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    //console.log(findResult.profileData.reviews[index])
    var updateResult = await collection.updateOne({
        //Selection criteria
        '_id': ObjectId(storeId)
    }, {
        //Updated data
        $set: findResult
    });

    // var updateResult = await collection.updateOne({
    //     _id: ObjectId(storeId)
    // }, {
    //     "profileData.products.productId": productId
    // }, {
    //     $set: {
    //         `profileData.products[${productId}].title`: data.title,
    //         "profileData.products.$.description": data.description,
    //         "profileData.products.$.price": data.price,
    //         "profileData.products.$.imgSrc": data.imgSrc
    //     }
    // });

    res.status(200).json({
        success: true,
        message: 'Product update successful!',
        product: findResult.profileData.products[index]
    });
};

const deleteProduct = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var storeId = req.params.storeId;
    var productId = req.params.productId;
    //var data = req.body;

    //identify store
    // var findResult = await collection.findOne({
    //     '_id': ObjectId(storeId)
    // });

    // for (var i = 0; i < findResult.profileData.products.length; i++) {
    //     if (findResult.profileData.products[i].productId == productId) {
    //         findResult.profileData.products.splice(i, 1);
    //         break
    //     };
    // };
    var updateResult = await collection.updateOne({
        _id: ObjectId(storeId)
    }, {
        $pull: {
            'profileData.products': {
                productId: productId
            }
        }
    });
    //update store (=delete product)
    // var updateResult = await collection.updateOne({
    //     //Selection criteria
    //     '_id': ObjectId(storeId)
    // }, {
    //     //Updated data
    //     $set: findResult
    // });
    console.log(updateResult)
    res.status(200).json({
        success: true,
        message: 'Successfully deleted the product!',
        result: updateResult
    });
};

const editReview = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var data = req.body;

    var findResult = await collection.findOne({
        '_id': ObjectId(data.id)
    });

    //var index = findResult.profileData.reviews.findIndex(rv => rv.userEmail === data.userEmail);
    var index = findResult.profileData.reviews.findIndex(rv => rv.reviewId === data.reviewId);
    //console.log(index)
    findResult.profileData.reviews[index].text = data.text;
    findResult.profileData.reviews[index].rating = data.rating;
    findResult.profileData.reviews[index].datetimeAdjusted = data.datetime;
    findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    //console.log(findResult.profileData.reviews[index])
    var updateResult = await collection.updateOne({
        //Selection criteria
        '_id': ObjectId(data.id)
    }, {
        //Updated data
        $set: findResult
    });
    //console.log(updateResult)

    res.status(200).json({
        success: true,
        message: 'Successfully edited review!',
        avgRating: findResult.profileData.avgRating,
        review: findResult.profileData.reviews[index]
    });
};

const addReview = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var collection_users = await getMongoUsersCollection();
    var data = req.body;

    var findResult = await collection.findOne({
        '_id': ObjectId(data.id)
    });

    //Check if User already submitted a review for this specific store (only 1 review per store and per user allowed)
    if (findResult.profileData.reviews.findIndex(rv => rv.userEmaild === '45')) {};

    //Define review id
    if (findResult.profileData.reviews.length == 0) {
        var reviewId = 0;
        //avg = single rating
        findResult.profileData.avgRating = data.rating;
    } else {
        //add as first element
        var reviewId = parseInt(findResult.profileData.reviews[0].reviewId) + 1;
        //add as last element
        //var reviewId = parseInt(findResult.profileData.reviews[findResult.profileData.reviews.length - 1].reviewId) + 1;

        //avg = newAve = ((oldAve*oldNumPoints) + x)/(oldNumPoints+1)
        //findResult.profileData.avgRating = 2.6
        //with for loop
        //without for loop
        //findResult.profileData.avgRating = (((parseFloat(findResult.profileData.avgRating) * findResult.profileData.reviews.length) + data.rating) / (findResult.profileData.reviews.length + 1)).toString();
    };

    //Get user first and last name
    var findResultUser = await collection_users.findOne({
        'email': data.userEmail
    });

    //findResult.profileData.reviews = [];
    findResult.profileData.reviews.unshift({
        "reviewId": reviewId.toString(),
        "userEmail": data.userEmail,
        "userName": findResultUser.lastName + ", " + findResultUser.firstName,
        "datetime": data.datetime,
        "datetimeAdjusted": "",
        "rating": data.rating,
        "text": data.text
    });
    findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    console.log(findResult.profileData);

    var updateResult = await collection.updateOne({
        //Selection criteria
        '_id': ObjectId(data.id)
    }, {
        //Updated data
        $set: findResult
    });
    console.log(updateResult)

    // var updateResult = await collection.updateOne({
    //     _id: ObjectId(storeId)
    // }, {
    //     $push: {
    //         'profileData.products': {
    //             productId: productId
    //         }
    //     }
    // });

    res.status(200).json({
        success: true,
        message: 'Successfully added review!',
        avgRating: findResult.profileData.avgRating,
        review: findResult.profileData.reviews[0]
    });
};

const deleteReview = async function (req, res, next) {
    var collection = await getMongoStoresCollection();
    var storeId = req.params.storeId;
    var reviewId = req.params.reviewId;
    //var data = req.body;

    // var findResult = await collection.findOne({
    //     '_id': ObjectId(storeId)
    // });
    // var i;
    // for (i = 0; i < findResult.profileData.reviews.length; i++) {
    //     if (findResult.profileData.reviews[i].reviewId == reviewId) {
    //         findResult.profileData.reviews.splice(i, 1);
    //         findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    //         //findResult.profileData.avgRating = (((parseFloat(findResult.profileData.avgRating) * findResult.profileData.reviews.length) + data.rating) / (findResult.profileData.reviews.length + 1)).toString();
    //         break
    //     };
    // };

    // var updateResult = await collection.updateOne({
    //     //Selection criteria
    //     '_id': ObjectId(storeId)
    // }, {
    //     //Updated data
    //     $set: findResult
    // });
    // console.log(updateResult)

    await collection.updateOne({
        _id: ObjectId(storeId)
    }, {
        $pull: {
            'profileData.reviews': {
                reviewId: reviewId
            }
        }
    });
    var findResult = await collection.findOne({
        '_id': ObjectId(storeId)
    });
    findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();

    res.status(200).json({
        success: true,
        message: 'Successfully deleted the review!',
        reviewId: reviewId,
        avgRating: findResult.profileData.avgRating
    });
};

function calculateAverage(array) {
    var value = 0.0;
    if (array.length > 0) {
        for (var i = 0; i < array.length; i++) {
            value = value + array[i].rating;
        }
        return value / array.length;
    } else {
        return 0;
    }
}

module.exports = {
    getSingleStore,
    getAllStores,
    getFilteredStores,
    getFilteredStores2,
    updateStore,
    deleteStore,
    createStore,
    editStore,
    addStoreImage,
    deleteStoreImage,
    addReview,
    editReview,
    deleteReview,
    addProduct,
    editProduct,
    deleteProduct
};