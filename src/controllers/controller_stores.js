"use strict";
//App imports
const NodeGeocoder = require('node-geocoder');

const geoCodeOptions = {
    provider: 'openstreetmap'
};
const geoCoder = NodeGeocoder(geoCodeOptions);

const mongodb = require('../mongodb');
const config = require('../config');
const ObjectId = require('mongodb').ObjectId;

const {
    productModel,
    reviewModel,
    storeModel
} = require('../data-models');

//var coll = mongodb.getClient().db(config.mongodb_name).collection("stores");


const geoCodeTest = async function (req, res, next) {
    let address = req.body.address;
    console.log(address)
    let result = await geoCoder.geocode(address)
    res.send(result);
};


async function getMongoStoresCollection() {
    return mongodb.getClient().db(config.mongodb_name).collection("stores");
};
// Get the MongoDB users collection
async function getMongoUsersCollection() {
    return mongodb.getClient().db(config.mongodb_name).collection("users");
}

const getSingleStore = async function (req, res, next) {
    let collection = await getMongoStoresCollection();
    //var id = new ObjectId(req.params.id);
    let result = await collection.findOne({
        '_id': ObjectId(req.params.id)
    });
    //var result = await collection.findOne(ObjectId(req.params.id));
    //console.log(result);
    res.send(result);
};

const getAllStores = async function (req, res, next) {
    let collection = await getMongoStoresCollection();
    let result = await collection.find().toArray();
    //console.log(result)
    //res.status(200).send(result);
    res.status(200).json({
        success: true,
        message: 'All stores successfully fetched!',
        stores: result
    });
};

const getFilteredStores = async function (req, res, next) {
    let collection = await getMongoStoresCollection();
    let searchTerm = req.params.searchterm;
    //var idArray = [];
    //var result = await collection.find().toArray();
    //db.stores.find({"profileData.tags":{$eq: "meat"}})
    let result = await collection.find({
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
    let collection = await getMongoStoresCollection();
    console.log(req.body)
    let filterObject = req.body;
    console.log(filterObject)
    //Create filter query (like here https://docs.mongodb.com/manual/tutorial/query-arrays/)
    let queryFilter = {};
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
    let result = await collection.find(queryFilter).toArray();

    res.status(200).json({
        success: true,
        message: 'Filtered stores successfully fetched!',
        stores: result,
        //idArray: idArray
    });
};

// const updateStore = async function (req, res, next) {
//     //function for changing user data except password and email!
//     let collection = await getMongoStoresCollection();
//     let storeId = req.params.storeId;
//     let data = req.body; //json format

//     let userEmail = req.userEmail;

//     let findResult = await collection.findOne({
//         '_id': ObjectId(storeId)
//     });

//     if (!findResult) {
//         return next({
//             status: 400,
//             message: "Store not found."
//         });
//     };
//     //Guard to make sure that only the store owner is able to edit this store
//     if (findResult.userEmail !== userEmail) {
//         return next({
//             status: 400,
//             message: "User unauthorized to edit this store."
//         });
//     };

//     //password routine
//     // if (data['password']) {
//     //     delete data['password'];
//     // };
//     // if (data['email']) {
//     //     delete data['email'];
//     // };

//     let result = await collection.updateOne({
//         //Selection criteria
//         'id': ObjectId(storeId)
//     }, {
//         //Updated data
//         $set: data
//     });

//     res.status(200).json({
//         success: true,
//         message: 'Store successfully updated!',
//         queryResult: result
//     });
// };

const deleteStore = async function (req, res, next) {
    let collectionStores = await getMongoStoresCollection();
    let collectionUsers = await getMongoUsersCollection();
    let userEmail = req.userEmail;
    let storeId = req.params.storeId;

    //Get the store to retrieve user email
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
            message: "User unauthorized to delete this store."
        });
    };

    //Delete Store
    let deleteStoreResult = await collectionStores.deleteOne({
        '_id': ObjectId(storeId)
    });

    //Set ownedStoreId at Owner to ""
    let updateUserResult = await collectionUsers.updateOne({
        'email': userEmail
    }, {
        $set: {
            ownedStoreId: ""
        }
    });

    res.status(200).json({
        success: true,
        message: 'Store successfully deleted!'
    });
};

const createStore = async function (req, res, next) {
    let collectionStores = await getMongoStoresCollection();
    let collectionUsers = await getMongoUsersCollection();
    let data = req.body;
    let userEmail = req.userEmail;

    //check if the user already owns a store
    let findResult = await collectionUsers.findOne({
        'email': ObjectId(userEmail)
    });
    if (findResult.ownedStoreId.length > 0) {
        return next({
            status: 400,
            message: "Creation unsuccessful. User already owns a store."
        });
    };

    let addressString = `${data.address.addressLine1}, ${data.address.postcode} ${data.address.city}, ${data.address.country}`
    console.log(addressString)
    let geoCodeResult = await geoCoder.geocode(addressString);
    console.log(geoCodeResult)
    let storeObject = {
        "userEmail": data.userEmail,
        "creationDate": new Date(),
        "mapData": {
            "address": data.address,
            "img": data.mapImg,
            "location": {
                "lat": geoCodeResult[0].latitude,
                "lng": geoCodeResult[0].longitude
            },
            "mapIcon": data.mapIcon
        },
        "profileData": {
            "title": data.title,
            "subtitle": data.subtitle,
            "description": data.description,
            "tags": data.tags,
            "images": data.images,
            "products": [],
            "reviews": [],
            "avgRating": "0"
        }
    };
    //add Ids to images -> Refactor with multiple images are there
    for (let i = 0; i < storeObject.profileData.images.length; i++) {
        storeObject.profileData.images[i]["id"] = i;
    };

    let insertResult = await collectionStores.insertOne(storeObject);
    if (insertResult.result.ok == 1) { //necessary with expression wrapper?
        let store = insertResult.ops[0];
        console.log("Store creation successfull!");
        console.log(store);

        //Write Store Id to user
        await collectionUsers.updateOne({
            email: data.userEmail
        }, {
            $set: {
                "ownedStoreId": store._id
            }
        });
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
    let collection = await getMongoStoresCollection();
    let data = req.body;
    let storeId = req.params.storeId;
    let userEmail = req.userEmail;

    let findResult = await collection.findOne({
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

    //let storeData = storeModel.get(options);

    let addressString = `${data.address.addressLine1}, ${data.address.postcode} ${data.address.city}, ${data.address.country}`
    let geoCodeResult = await geoCoder.geocode(addressString);

    let updateResult = await collection.updateOne({
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
            "mapData.address.country": data.address.country,
            "mapData.mapIcon": data.mapIcon,
            "mapData.location.lat": geoCodeResult[0].latitude,
            "mapData.location.lng": geoCodeResult[0].longitude
        }
    });

    res.status(200).json({
        success: true,
        message: 'Store update successful!',
        //queryResult: updateResult
    });
};

// const addStoreImage = async function (req, res, next) {
//     let collection = await getMongoStoresCollection();
//     let data = req.body;
//     let storeId = req.params.storeId;
//     let userEmail = req.userEmail;

//     let findResult = await collection.findOne({
//         '_id': ObjectId(storeId)
//     });

//     if (!findResult) {
//         return next({
//             status: 400,
//             message: "Store not found."
//         });
//     };
//     //Guard to make sure that only the store owner is able to edit this store
//     if (findResult.userEmail !== userEmail) {
//         return next({
//             status: 400,
//             message: "User unauthorized to edit this store."
//         });
//     };
//     //Guard to check if there are max 10 images
//     if (findResult.profileData.images.length >= 10) {
//         return next({
//             status: 400,
//             message: "Only 10 images can be uploaded per store."
//         });
//     };

//     let imageData = {
//         "id": findResult.profileData.images.length.toString(),
//         "src": data.imageSrc,
//         "title": data.title
//     };
//     let updateResult = await collection.updateOne({
//         _id: ObjectId(storeId)
//     }, {
//         $push: {
//             'profileData.images': imageData
//         }
//     });

//     res.status(200).json({
//         success: true,
//         message: 'Successfully added store image!',
//         result: updateResult,
//         imageData: imageData
//     });
// };

// const deleteStoreImage = async function (req, res, next) {
//     let collection = await getMongoStoresCollection();
//     let data = req.body;
//     let storeId = req.params.storeId;
//     let imageId = req.params.imageId;
//     let userEmail = req.userEmail;

//     console.log(storeId)
//     console.log(imageId)
//     console.log(data)
//     // var imageData = {
//     //     imageSrc: data.imageSrc,
//     //     title: data.title
//     // }

//     let findResult = await collection.findOne({
//         '_id': ObjectId(storeId)
//     });

//     if (!findResult) {
//         return next({
//             status: 400,
//             message: "Store not found."
//         });
//     };
//     //Guard to make sure that only the store owner is able to edit this store
//     if (findResult.userEmail !== userEmail) {
//         return next({
//             status: 400,
//             message: "User unauthorized to edit this store."
//         });
//     };

//     let updateResult = await collection.updateOne({
//         _id: ObjectId(storeId)
//     }, {
//         $pull: {
//             'profileData.images': {
//                 id: imageId,
//                 //src: data.imageSrc,
//                 //title: data.title
//             }
//         }
//     }, {
//         multi: true
//     });
//     console.log(updateResult.result)
//     res.status(200).json({
//         success: true,
//         message: 'Successfully deleted store image!',
//         //result: updateResult
//     });
// };

const createProduct = async function (req, res, next) {
    let collection = await getMongoStoresCollection();
    let data = req.body;
    let userEmail = req.userEmail;
    let storeId = req.params.storeId;

    let findResult = await collection.findOne({
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

    //Define product id
    let productId;
    if (findResult.profileData.products.length === 0) {
        productId = 0;
    } else {
        productId = parseInt(findResult.profileData.products[findResult.profileData.products.length - 1].productId) + 1;
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

    let options = {
        "datetimeCreated": new Date(),
        "datetimeAdjusted": "",
        "productId": productId.toString(),
        "storeId": data.storeId,
        "title": data.title,
        "description": data.description,
        "imgSrc": data.imgSrc,
        "price": data.price,
        "currency": data.currency,
        "currencySymbol": data.currencySymbol,
        "quantityType": data.quantityType,
        "quantityValue": data.quantityValue
    };
    const productData = productModel.get(options)
    // var updateResult = await collection.updateOne({
    //     //Selection criteria
    //     '_id': ObjectId(data.storeId)
    // }, {
    //     //Updated data
    //     $set: findResult
    // });

    await collection.updateOne({
        _id: ObjectId(storeId)
    }, {
        $push: {
            'profileData.products': productData
        }
    });

    // findResult = await collection.findOne({
    //     '_id': ObjectId(data.storeId)
    // });

    res.status(200).json({
        success: true,
        message: 'Successfully added product!',
        productId: productId
        // result: updateResult,
        // product: productData
    });
};

const editProduct = async function (req, res, next) {
    const collection = await getMongoStoresCollection();
    let data = req.body;
    let storeId = req.params.storeId;
    let productId = req.params.productId;
    let userEmail = req.userEmail;

    let findResult = await collection.findOne({
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

    // var findResult = await collection.findOne({
    //     '_id': ObjectId(storeId)
    // });

    // var index = findResult.profileData.products.findIndex(pr => pr.productId === productId);
    // findResult.profileData.products[index].title = data.title;
    // findResult.profileData.products[index].description = data.description;
    // findResult.profileData.products[index].price = data.price;
    // findResult.profileData.products[index].imgSrc = data.imgSrc;
    // findResult.profileData.products[index].quantityType = data.quantityType;
    // findResult.profileData.products[index].quantityValue = data.quantityValue;
    // findResult.profileData.products[index].datetimeAdjusted = data.datetime;
    // //findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    // //console.log(findResult.profileData.reviews[index])
    // var updateResult = await collection.updateOne({
    //     //Selection criteria
    //     '_id': ObjectId(storeId)
    // }, {
    //     //Updated data
    //     $set: findResult
    // });
    //console.log(productId)
    // var updateResult = await collection.updateOne({
    //     "_id": ObjectId(storeId),
    //     "profileData.products.productId": productId
    // }, {
    //     $set: {
    //         "profileData.products.$.title": data.title,
    //         "profileData.products.$.description": data.tidescriptiontle,
    //         "profileData.products.$.price": data.price,
    //         "profileData.products.$.imgSrc": data.imgSrc,
    //         "profileData.products.$.quantityType": data.quantityType,
    //         "profileData.products.$.quantityValue": data.quantityValue,
    //         "profileData.products.$.datetimeAdjusted": new Date(),
    //     }
    // }, {
    //     upsert: false
    // });

    let updateResult = await collection.updateOne({
        "_id": ObjectId(storeId),
        "profileData.products.productId": productId
    }, {
        $set: {
            "profileData.products.$.title": data.title,
            "profileData.products.$.description": data.description,
            "profileData.products.$.price": data.price,
            "profileData.products.$.imgSrc": data.imgSrc,
            "profileData.products.$.quantityType": data.quantityType,
            "profileData.products.$.quantityValue": data.quantityValue,
            "profileData.products.$.datetimeAdjusted": new Date()
        }
    }, {
        returnOriginal: false
    });

    if (!updateResult || !updateResult.result.nModified) {
        console.log("not updated")
        return next({
            status: 400,
            message: "Store not found or wrong ids provided. Product was not updated."
        });
    };

    //console.log(updateResult)
    //let index = updateResult.value.profileData.products.findIndex(pr => pr.productId === productId);
    res.status(200).json({
        success: true,
        message: 'Product update successful!',
        // modifiedCount: updateResult.modifiedCount,
        // product: updateResult.value.profileData.products[index]
    });
};

const updateStockAmount = async function (req, res, next) {
    let collection = await getMongoStoresCollection();
    let storeId = req.params.storeId;
    let productId = req.params.productId;
    let userEmail = req.userEmail;
    let data = req.body;

    let findResult = await collection.findOne({
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

    // var setString = "profileData.products.$.productId[" + productId.toString() + "].stockAmount"
    // console.log(setString)
    let updateResult = await collection.updateOne({
        "_id": ObjectId(storeId),
        "profileData.products.productId": productId
    }, {
        $set: {
            //setString: data.stockAmount
            "profileData.products.$.stockAmount": parseInt(data.stockAmount)
        }
    }, {
        upsert: false
    });

    if (!updateResult || !updateResult.result.nModified) {
        console.log("not updated")
        return next({
            status: 400,
            message: "Store not found or wrong ids provided. Product was not updated."
        });
    };
    // console.log(updateResult.modifiedCount)
    // console.log(updateResult.matchedCount)
    // var findResult = await collection.findOne({
    //     $and: [{
    //         '_id': ObjectId(storeId),
    //         "profileData.products.productId": productId
    //     }]
    // });

    // console.log(findResult.profileData.products)
    res.status(200).json({
        success: true,
        message: 'Product stock updated.',
        //product: findResult.profileData.products[index]
    });
};

const deleteProduct = async function (req, res, next) {
    let collection = await getMongoStoresCollection();
    let storeId = req.params.storeId;
    let productId = req.params.productId;
    let userEmail = req.userEmail;
    //var data = req.body;

    let findResult = await collection.findOne({
        '_id': ObjectId(storeId)
    });

    //Guard to make sure that only the store owner is able to edit this store
    if (findResult.userEmail !== userEmail) {
        return next({
            status: 400,
            message: "User unauthorized to edit this store."
        });
    };

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
    let updateResult = await collection.updateOne({
        _id: ObjectId(storeId)
    }, {
        $pull: {
            'profileData.products': {
                productId: productId
            }
        }
    });

    if (!updateResult || !updateResult.result.nModified) {
        console.log("not updated")
        return next({
            status: 400,
            message: "Store not found or wrong ids provided. Product was not updated."
        });
    };
    //update store (=delete product)
    // var updateResult = await collection.updateOne({
    //     //Selection criteria
    //     '_id': ObjectId(storeId)
    // }, {
    //     //Updated data
    //     $set: findResult
    // });
    //console.log(updateResult)
    res.status(200).json({
        success: true,
        message: 'Successfully deleted the product!',
        //result: updateResult
    });
};

const editReview = async function (req, res, next) {
    let collection = await getMongoStoresCollection();
    let data = req.body;
    let storeId = req.params.storeId;
    let reviewId = req.params.reviewId;
    console.log(req.userEmail)

    let findResult = await collection.findOne({
        '_id': ObjectId(storeId)
    });
    if (!findResult) {
        return next({
            status: 400,
            message: "Wrong store id provided."
        });
    };
    //var index = findResult.profileData.reviews.findIndex(rv => rv.userEmail === data.userEmail);
    let index = findResult.profileData.reviews.findIndex(rv => rv.reviewId === reviewId);
    //console.log(index)
    findResult.profileData.reviews[index].text = data.text;
    findResult.profileData.reviews[index].rating = data.rating;
    findResult.profileData.reviews[index].datetimeAdjusted = new Date();
    findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    //console.log(findResult.profileData.reviews[index])
    await collection.updateOne({
        //Selection criteria
        '_id': ObjectId(storeId)
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
    //TODO check if user bought a product at store
    let collectionStores = await getMongoStoresCollection();
    let collectionUsers = await getMongoUsersCollection();
    let data = req.body;
    let storeId = req.params.storeId;
    console.log(req.userEmail)

    let findResult = await collectionStores.findOne({
        '_id': ObjectId(storeId)
    });

    if (!findResult) {
        return next({
            status: 400,
            message: "Wrong store id provided."
        });
    };
    //Check if User already submitted a review for this specific store (only 1 review per store and per user allowed)
    // if (findResult.profileData.reviews.findIndex(rv => rv.userEmail === req.userEmail)) {
    //     console.log("found")
    //     return next({
    //         status: 400,
    //         message: "User already submitted a review for this store."
    //     })
    // };

    //Define review id
    let reviewId;
    if (findResult.profileData.reviews.length === 0) {
        reviewId = 0;
        //avg = single rating
        findResult.profileData.avgRating = data.rating;
    } else {
        //add as first element
        reviewId = parseInt(findResult.profileData.reviews[0].reviewId) + 1;
        //add as last element
        //var reviewId = parseInt(findResult.profileData.reviews[findResult.profileData.reviews.length - 1].reviewId) + 1;

        //avg = newAve = ((oldAve*oldNumPoints) + x)/(oldNumPoints+1)
        //findResult.profileData.avgRating = 2.6
        //with for loop
        //without for loop
        //findResult.profileData.avgRating = (((parseFloat(findResult.profileData.avgRating) * findResult.profileData.reviews.length) + data.rating) / (findResult.profileData.reviews.length + 1)).toString();
    };

    //Get user first and last name
    let findResultUser = await collectionUsers.findOne({
        'email': req.userEmail
    });

    if (!findResultUser) {
        return next({
            status: 400,
            message: "User not found."
        });
    };

    let options = {
        "reviewId": reviewId.toString(),
        "userEmail": req.userEmail,
        "userFirstName": findResultUser.firstName,
        "userLastName": findResultUser.lastName,
        "userName": findResultUser.lastName + ", " + findResultUser.firstName,
        "datetimeCreated": new Date(),
        "datetimeAdjusted": "",
        "rating": data.rating,
        "text": data.text
    };
    let reviewData = reviewModel.get(options);
    //findResult.profileData.reviews = [];
    // findResult.profileData.reviews.unshift({
    //     "reviewId": reviewId.toString(),
    //     "userEmail": req.userEmail,
    //     "userName": findResultUser.lastName + ", " + findResultUser.firstName,
    //     "datetimeCreated": new Date(),
    //     "datetimeAdjusted": "",
    //     "rating": data.rating,
    //     "text": data.text
    // });
    findResult.profileData.reviews.unshift(reviewData);
    findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    //console.log(findResult.profileData);

    await collectionStores.updateOne({
        //Selection criteria
        '_id': ObjectId(storeId)
    }, {
        //Updated data
        $set: findResult
    });
    //console.log(updateResult)

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
    let collection = await getMongoStoresCollection();
    let storeId = req.params.storeId;
    let reviewId = req.params.reviewId;
    let userEmail = req.userEmail;
    //var data = req.body;
    // let findResult2 = await collection.findOne({
    //     '_id': ObjectId(storeId),
    //     'profileData.reviews': {
    //         $elemMatch: {
    //             userEmail: userEmail
    //         }
    //     }
    // });
    // console.log(findResult2);
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

    let updateResult = await collection.updateOne({
        _id: ObjectId(storeId)
    }, {
        $pull: {
            'profileData.reviews': {
                reviewId: reviewId,
                userEmail: userEmail
            }
        }
    });

    if (!updateResult || !updateResult.result.nModified) {
        console.log("not updated")
        return next({
            status: 400,
            message: "Review not found or wrong user."
        });
    };

    //update average rating
    let findResult = await collection.findOne({
        '_id': ObjectId(storeId)
    });
    findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    await collection.updateOne({
        _id: ObjectId(storeId)
    }, {
        $set: findResult
    });

    res.status(200).json({
        success: true,
        message: 'Successfully deleted the review!',
        reviewId: reviewId,
        avgRating: findResult.profileData.avgRating
    });
};

const getStoresByLocation = async function (req, res, next) {
    let collectionStores = await getMongoStoresCollection();
    let min_lat = parseFloat(req.params.min_lat);
    let max_lat = parseFloat(req.params.max_lat);
    let min_lng = parseFloat(req.params.min_lng);
    let max_lng = parseFloat(req.params.max_lng);

    //Query: gte: greater than or equal; lte: less than or equal; value in an array: { $in: [ 5, 15 ] }
    //Get stores whose lat is >
    console.log(`lat min: ${min_lat}; lat max: ${max_lat}`)
    console.log(`lng min: ${min_lng}; lng max: ${max_lng}`)

    var fetchResult = await collectionStores.find({
        $and: [{
            "mapData.location.lat": {
                $gte: min_lat,
                $lte: max_lat
            },
            "mapData.location.lng": {
                $gte: min_lng,
                $lte: max_lng
            }
        }]
    }).limit(100).toArray();

    //console.log(fetchResult[0].mapData.location)

    res.status(200).json({
        success: true,
        message: 'Stores successfully fetched!',
        stores: fetchResult
    });
};

function calculateAverage(array) {
    let value = 0.0;
    if (array.length > 0) {
        for (let i = 0; i < array.length; i++) {
            value = value + array[i].rating;
        }
        return (value / array.length).toFixed(2);
    } else {
        return 0;
    }
}

module.exports = {
    getSingleStore,
    getAllStores,
    getFilteredStores,
    getFilteredStores2,
    //updateStore,
    deleteStore,
    createStore,
    editStore,
    //addStoreImage,
    //deleteStoreImage,
    addReview,
    editReview,
    deleteReview,
    createProduct,
    editProduct,
    deleteProduct,
    updateStockAmount,
    geoCodeTest,
    getStoresByLocation
};