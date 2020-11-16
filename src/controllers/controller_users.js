"use strict";
//App imports
const mongodb = require('../mongodb');
const config = require('../config');
//External imports
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
//const axios = require('axios');

/*
Data Model
User: {
    "firstName": "Max",
    "lastName": "Mustermann",
    "email": "max.mustermann@web.de",
    "birthDate": "01.01.2000",
    "password": "test",
    "city": "Musterstadt",
    "postcode": "11111",
    "addressLine1": "Musterstraße 1",
    "shoppingCart": [{product: product, amount: 5},{product: product, amount: 5}]
}
*/



// Create a token from a payload
function createToken(payload) {
    var expiresIn = config.keyExpiresIn;
    return jwt.sign(payload, config.secretKey, {
        expiresIn
    });
};
// Verify the token
function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY);
};
// Get the MongoDB users collection
async function getMongoUsersCollection() {
    // console.log("@ function 2")
    // console.log(config.mongodb_name)
    //console.log(mongodb.getClient())
    return mongodb.getClient().db(config.mongodb_name).collection("users");
}

//const mongoUserCollection = mongodb.getClient().db(config.mongodb_name).collection("users");

const getSingleUser = async function (req, res, next) {
    var collection = await getMongoUsersCollection();
    var email = req.params.email;

    var result = await collection.findOne({
        'email': email
    });

    res.send(result);
}

const registerUser = async function (req, res, next) {
    var collection = await getMongoUsersCollection();
    console.log(collection)
    var data = req.body;
    console.log(data)
    var passwordHash = await bcrypt.hash(data.password, config.saltRounds);
    // console.log(passwordHash);
    // console.log(data);
    data["password"] = passwordHash;
    data["shoppingCart"] = [];
    var insertResult = await collection.insertOne(data);
    if (insertResult.result.ok == 1) {
        var user = insertResult.ops[0];
        console.log("Registration successful!");
        console.log(user);
    } else {
        console.log("Registration failed!");
        next("Registration failed!");
    }

    var accessToken = createToken({
        id: user._id.toString(),
        email: user.email
    });

    res.status(200).json({
        success: true,
        message: 'Registration successful!',
        user: {
            token: accessToken,
            authorizationRole: "Role1",
            email: user.email,
            ownedStoreId: "",
            address: {
                firstName: user.firstName,
                lastName: user.lastName,
                addressLine1: user.addressLine1,
                postcode: user.postcode,
                city: user.city,
            },
            shoppingCart: [],
            productCounter: 0
        }
    });
}

const loginUser = async function (req, res, next) {
    var collection = await getMongoUsersCollection();

    var email = req.body.email;
    var password = req.body.password;

    var user = await collection.findOne({
        'email': email
    });

    var match = await bcrypt.compare(password, user.password);
    if (match) {
        console.log("logged in " + email + " successfully!");
        var accessToken = createToken({
            id: user._id.toString(),
            email: user.email
        });
        console.log(accessToken)

        //Cookie--------------
        // res.status(200)
        // // res.header({
        // //     //"Access-Control-Allow-Origin:": "http://localhost:8080"
        // //     //"Access-Control-Allow-Credentials": true
        // //     "Access-Control-Allow-Headers": "Content-Type,Accept"
        // // })
        // res.header({
        //     "withCredentials": true
        // })
        // res.cookie('access_token', accessToken, {
        //     httpOnly: false,
        //     secure: false,
        //     signed: false,
        //     path: "/",
        //     maxAge: 1800000
        //     //domain: '127.0.0.1'
        // })
        // res.send("{success: true}");

        var counter = 0;
        for (var i = 0; i < user.shoppingCart.length; i++) {
            counter = counter + user.shoppingCart[i][1];
        }
        console.log(counter)
        //Storage--------------
        res.status(200).json({
            success: true,
            message: 'Authentication successful!',
            user: {
                token: accessToken,
                authorizationRole: "Role1",
                email: user.email,
                ownedStoreId: user.ownedStoreId,
                address: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    addressLine1: user.addressLine1,
                    postcode: user.postcode,
                    city: user.city,
                },
                shoppingCart: user.shoppingCart,
                productCounter: counter
            }
        });

    } else {
        console.log("password does not match!");
        next({
            status: 403,
            message: "Unauthorized. Password does not match!"
        })
    };
}

const getAllUsers = async function (req, res, next) {
    var collection = await getMongoUsersCollection();

    var result = await collection.find().toArray();
    //console.log(result)
    res.status(200).send(result);
}

const updateUserInfo = async function (req, res, next) {
    //function for changing user data except password, email and shopping cart!
    var collection = await getMongoUsersCollection();
    var email = req.params.email;
    var data = req.body; //json format

    //remove password email cart fields from data
    if (data['password']) {
        delete data['password'];
    };
    if (data['email']) {
        delete data['email'];
    };
    if (data['shoppingCart']) {
        delete data['shoppingCart'];
    };

    var result = await collection.updateOne({
        //Selection criteria
        'email': email
    }, {
        //Updated data
        $set: data
    });

    res.status(200).json({
        success: true,
        message: 'User successfully updated!',
        queryResult: result
    });
}

const deleteUser = async function (req, res, next) {
    var collection = await getMongoUsersCollection();
    var email = req.params.email;

    var result = await collection.remove({
        'email': email
    });

    res.status(200).json({
        success: true,
        message: 'User successfully deleted!',
        queryResult: result
    });
}


const addToShoppingCart = async function (req, res, next) {
    //payload: params: email, body:{product,amount}
    var collection = await getMongoUsersCollection();
    var email = req.params.email;
    console.log(email)
    var addedProduct = req.body.product;
    console.log(addedProduct)
    var addedAmount = req.body.amount;
    console.log(addedAmount)

    var user = await collection.findOne({
        'email': email
    });
    var currentShoppingCart = user.shoppingCart;
    console.log(currentShoppingCart)
    //Check if product is already inside cart
    var found = false;
    if (currentShoppingCart.length > 0) {
        for (var i = 0; i < currentShoppingCart.length; i++) {
            //Check if added product is already in cart and increase amount if yes
            if (currentShoppingCart[i][0].productId == addedProduct.productId && currentShoppingCart[i][0].storeId == addedProduct.storeId) {
                currentShoppingCart[i][1] = currentShoppingCart[i][1] + addedAmount;
                found = true;
                break;
            }
        }
    }
    //add product to cart if it is not already there
    if (found == false) {
        currentShoppingCart.push([addedProduct, addedAmount])
    }

    var result = await collection.updateOne({
        //Selection criteria
        'email': email
    }, {
        //Updated data
        $set: {
            shoppingCart: currentShoppingCart
        }
    });

    res.status(200).json({
        success: true,
        message: 'Products successfully added to cart!',
        shoppingCart: currentShoppingCart
    });
}

const removeFromShoppingCart = async function (req, res, next) {
    //payload: params: email, body:{product,amount}
    var collection = await getMongoUsersCollection();
    var email = req.params.email;
    var removedProduct = req.body.product;
    var removedAmount = req.body.amount;

    var user = await collection.findOne({
        'email': email
    });
    var currentShoppingCart = user.shoppingCart;

    var found = false;
    for (var i = 0; i < currentShoppingCart.length; i++) {
        //Check if added product exists in cart
        if (currentShoppingCart[i][0].productId == removedProduct.productId && currentShoppingCart[i][0].storeId == removedProduct.storeId) {
            currentShoppingCart[i][1] = currentShoppingCart[i][1] - removedAmount;
            //Delete the array element if amount == 0
            if (currentShoppingCart[i][1] <= 0) {
                currentShoppingCart.splice(i, 1);
                console.log(currentShoppingCart)
            }
            found = true;
            break;
        }
    }
    if (found == true) {
        var result = await collection.updateOne({
            //Selection criteria
            'email': email
        }, {
            //Updated data
            $set: {
                shoppingCart: currentShoppingCart
            }
        });
        console.log(result)
        res.status(200).json({
            success: true,
            message: 'Products successfully removed from cart!',
            shoppingCart: currentShoppingCart
        });

    } else if (found == false) {
        res.status(200).json({
            success: true,
            message: 'Product was not found inside cart!',
            shoppingCart: currentShoppingCart
        });
    }
}

module.exports = {
    getSingleUser,
    registerUser,
    loginUser,
    getAllUsers,
    updateUserInfo,
    deleteUser,
    addToShoppingCart,
    removeFromShoppingCart
    //logoutUser
};