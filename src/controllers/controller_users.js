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
Order: {
    id
    


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
    return mongodb.getClient().db(config.mongodb_name).collection("users");
}

//const mongoUserCollection = mongodb.getClient().db(config.mongodb_name).collection("users");

const getSingleUser = async function (req, res, next) {
    var collection = await getMongoUsersCollection();
    var email = req.params.email;

    var result = await collection.findOne({
        'email': email
    });
    //console.log(result);
    res.send(result);
}

const registerUser = async function (req, res, next) {
    var collection = await getMongoUsersCollection();
    var data = req.body;
    var passwordHash = await bcrypt.hash(data.password, config.saltRounds);
    // console.log(passwordHash);
    // console.log(data);
    data["password"] = passwordHash;
    data["shoppingCart"] = [];
    var insertResult = await collection.insertOne(data);
    if (insertResult.result.ok == 1) {
        var user = insertResult.ops[0];
        console.log("Registration successfull!");
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
            shoppingCart: []
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

        //Storage--------------
        res.status(200).json({
            success: true,
            message: 'Authentication successful!',
            user: {
                token: accessToken,
                authorizationRole: "Role1",
                email: user.email,
                shoppingCart: user.shoppingCart
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

const updateUser = async function (req, res, next) {
    //function for changing user data except password and email!
    var collection = await getMongoUsersCollection();
    var email = req.params.email;
    var data = req.body; //json format

    //password routine
    if (data['password']) {
        delete data['password'];
    };
    if (data['email']) {
        delete data['email'];
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


// const logoutUser = async function (req, res, next) {
//     res.status(200).send({
//         token: null
//     });
// }

module.exports = {
    getSingleUser,
    registerUser,
    loginUser,
    getAllUsers,
    updateUser,
    deleteUser
    //logoutUser
};