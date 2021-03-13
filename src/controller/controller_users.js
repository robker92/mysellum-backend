'use strict';

import { StatusCodes } from 'http-status-codes';

import { ObjectId } from 'mongodb';

import {
    JWT_SECRET_KEY,
    JWT_KEY_EXPIRE,
    PW_HASH_SALT_ROUNDS,
    PW_RESET_TOKEN_NUM_BYTES,
} from '../config';

import { getUserModel } from '../data-models';

//External imports
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
//const axios = require('axios');

import { sendNodemailerMail } from '../mailing/nodemailer';

import {
    getMongoStoresCollection,
    getMongoUsersCollection,
    getMongoProductsCollection,
} from '../mongodb/collections';

// const {
//     fail
// } = require('assert');

// Create a token from a payload
function createToken(payload) {
    var expiresIn = JWT_KEY_EXPIRE;
    return jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn,
    });
}
// Verify the token
function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET_KEY);
}

const getSingleUser = async function (req, res, next) {
    let collection = await getMongoUsersCollection();
    let email = req.params.email;

    let result = await collection.findOne({
        email: email,
    });

    res.send(result);
    return;
};

const registerUser = async function (req, res, next) {
    const collection = await getMongoUsersCollection();
    const data = req.body;

    //Check if e-mail already used
    const checkResult = await collection.findOne({
        email: data.email,
    });
    console.log(checkResult);
    if (checkResult) {
        return next({
            status: StatusCodes.UNAUTHORIZED,
            type: 'alreadyUsed',
            message: 'E-Mail already used.',
        });
    }

    const passwordHash = await bcrypt.hash(data.password, PW_HASH_SALT_ROUNDS);
    const verificationToken = crypto
        .randomBytes(PW_RESET_TOKEN_NUM_BYTES)
        .toString('hex');

    // data["password"] = passwordHash;
    // data["creationDate"] = new Date();
    // data["emailConfirmed"] = false;
    // data["shoppingCart"] = [];
    // data["confirmRegistrationToken"] = confirmationToken;
    // data["confirmRegistrationExpires"] = Date.now() + 3600000; //Current time in milliseconds + one hour

    // get user data model function
    const options = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: passwordHash,
        city: data.city,
        postcode: data.postcode,
        addressLine1: data.addressLine1,
        birthdate: data.birthdate,
        verificationToken: verificationToken,
    };
    const userData = getUserModel(options);
    console.log(userData);

    const insertResult = await collection.insertOne(userData);
    let user;
    if (insertResult.result.ok == 1) {
        user = insertResult.ops[0];
        console.log('Registration successful!');
        console.log(user);
    } else {
        console.log('Registration failed!');
        return next({
            status: StatusCodes.UNAUTHORIZED,
            type: 'failed',
            message: 'Registration failed!',
        });
    }
    //console.log(data);

    //send email confirmation mail
    let mailOptions = {
        email: data.email,
        contentType: 'registrationVerification',
        verificationToken: verificationToken,
    };

    try {
        //await sendNodemailerMail(mailOptions);
    } catch (error) {
        console.log(error);
        return next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            type: 'whileMailSending',
            message: 'Error while sending!',
        });
    }

    // let accessToken = createToken({
    //     id: user._id.toString(),
    //     email: user.email
    // });

    // res.status(200).json({
    //     success: true,
    //     message: 'Registration successful!',
    //     user: {
    //         token: accessToken,
    //         authorizationRole: "Role1",
    //         email: user.email,
    //         ownedStoreId: "",
    //         address: {
    //             firstName: user.firstName,
    //             lastName: user.lastName,
    //             addressLine1: user.addressLine1,
    //             postcode: user.postcode,
    //             city: user.city,
    //         },
    //         shoppingCart: [],
    //         productCounter: 0
    //     }
    // });
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Registration verification e-mail successfully sent!',
    });
    return;
};

const verifyRegistration = async function (req, res, next) {
    let collection = await getMongoUsersCollection();
    let verificationToken = req.params.verificationToken;

    if (!verificationToken) {
        return next({
            status: StatusCodes.UNAUTHORIZED,
            success: false,
            type: 'verification',
            message: 'No token provided.',
        });
    }

    collection.findOneAndUpdate(
        {
            verifyRegistrationToken: verificationToken,
            verifyRegistrationExpires: {
                $gt: Date.now(),
            },
        },
        {
            $set: {
                verifyRegistrationToken: null,
                verifyRegistrationExpires: null,
                emailVerified: true,
            },
        },
        {
            returnOriginal: false,
            upsert: false,
        },
        (err, result) => {
            console.log(err);
            console.log(result);
            if (err) {
                //console.warn(err);
                return next({
                    status: StatusCodes.UNAUTHORIZED,
                    success: false,
                    type: 'verification',
                    message: 'E-Mail verification failed.',
                });
            } else if (result.value === null) {
                return next({
                    status: StatusCodes.UNAUTHORIZED,
                    success: false,
                    type: 'verification',
                    message: 'E-Mail verification failed.',
                });
            } else {
                const user = result.value;
                // if (!user) {
                //     return next({
                //         status: 403,
                //         message: "Password reset failed."
                //     });
                // };

                let accessToken = createToken({
                    id: user._id.toString(),
                    email: user.email,
                });

                res.status(StatusCodes.CREATED)
                    .cookie('authToken', accessToken)
                    .json({
                        success: true,
                        message: 'Registration successful!',
                        user: {
                            //token: accessToken,
                            authorizationRole: 'Role1',
                            email: user.email,
                            name: {
                                firstName: user.firstName,
                                lastName: user.lastName,
                            },
                            ownedStoreId: '',
                            // address: {
                            //     firstName: user.value.firstName,
                            //     lastName: user.value.lastName,
                            //     addressLine1: user.value.addressLine1,
                            //     postcode: user.value.postcode,
                            //     city: user.value.city,
                            // },
                            shoppingCart: [],
                            productCounter: 0,
                        },
                        shoppingCart: user.shoppingCart,
                        // productCounter: counter
                    });
            }
        }
    );
    return;

    // updates[i] = collectionStores.findOneAndUpdate({
    //     "_id": ObjectId(products[i][0].storeId),
    //     "profileData.products.productId": products[i][0].productId
    // }, {
    //     $inc: {
    //         "profileData.products.$.stockAmount": -products[i][1] //reduce stock amount by purchased amount
    //     }
    // }, {
    //     upsert: false
    // });
};

const loginUser = async function (req, res, next) {
    let collection = await getMongoUsersCollection();

    let email = req.body.email;
    let password = req.body.password;

    let user = await collection.findOne({
        email: email,
    });

    if (!user) {
        return next({
            success: false,
            status: 401,
            type: 'incorrect',
            message: 'Combination of username and password was incorrect.',
        });
    }

    if (user.emailVerified === false) {
        return next({
            success: false,
            status: 401,
            type: 'verification',
            message: 'E-mail address was not verified.',
        });
    }

    let match = await bcrypt.compare(password, user.password);
    let accessToken;
    if (match) {
        console.log('logged in ' + email + ' successfully!');
        accessToken = createToken({
            id: user._id.toString(),
            email: user.email,
        });
        console.log(accessToken);

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

        let counter = 0;
        for (let i = 0; i < user.shoppingCart.length; i++) {
            counter = counter + user.shoppingCart[i][1];
        }
        console.log(counter);
        //Storage--------------
        res.status(200)
            .cookie('authToken', accessToken)
            .json({
                success: true,
                message: 'Successfully logged in!',
                user: {
                    //token: accessToken,
                    authorizationRole: 'Role1',
                    email: user.email,
                    name: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                    },
                    ownedStoreId: user.ownedStoreId,
                    // address: {
                    //     firstName: user.firstName,
                    //     lastName: user.lastName,
                    //     addressLine1: user.addressLine1,
                    //     postcode: user.postcode,
                    //     city: user.city,
                    // },
                    shoppingCart: user.shoppingCart,
                    productCounter: counter,
                },
                shoppingCart: user.shoppingCart,
                productCounter: counter,
            });
    } else {
        //console.log("password does not match!");
        next({
            status: 401,
            success: false,
            type: 'incorrect',
            message: 'Combination of username and password was incorrect.',
        });
    }
};

const getAllUsers = async function (req, res, next) {
    var collection = await getMongoUsersCollection();

    var result = await collection.find().toArray();
    //console.log(result)
    res.status(200).send(result);
};

const updateUserInfo = async function (req, res, next) {
    //function for changing user data except password, email and shopping cart!
    var collection = await getMongoUsersCollection();
    var email = req.params.email;
    var data = req.body; //json format

    //remove password email cart fields from data
    if (data['password']) {
        delete data['password'];
    }
    if (data['email']) {
        delete data['email'];
    }
    if (data['shoppingCart']) {
        delete data['shoppingCart'];
    }

    var result = await collection.updateOne(
        {
            //Selection criteria
            email: email,
        },
        {
            //Updated data
            $set: data,
        }
    );

    res.status(200).json({
        success: true,
        message: 'User successfully updated!',
        queryResult: result,
    });
};

const deleteUser = async function (req, res, next) {
    var collection = await getMongoUsersCollection();
    var email = req.params.email;

    var result = await collection.remove({
        email: email,
    });

    res.status(200).json({
        success: true,
        message: 'User successfully deleted!',
        queryResult: result,
    });
};

const addToShoppingCart = async function (req, res, next) {
    //payload: params: email, body:{product,amount}
    let collectionUsers = await getMongoUsersCollection();
    let collectionStores = await getMongoStoresCollection();
    let collectionProducts = await getMongoProductsCollection();
    let email = req.params.email;
    let addedProduct = req.body.product;
    let addedAmount = parseInt(req.body.amount);

    //Get the product from the database and save it in the shopping cart
    let store = await collectionStores.findOne({
        _id: ObjectId(addedProduct.storeId),
    });
    if (!store) {
        //when no store was found -> wrong store id in the payload
        return next({
            status: 400,
            message: 'Wrong store id provided.',
        });
    }
    //retrieve the product from the store document
    // let productFromDB = store.profileData.products.filter(obj => {
    //     return obj._id === addedProduct._id
    // })[0];

    let productFromDB = await collectionProducts.findOne({
        _id: ObjectId(addedProduct._id),
    });
    if (!productFromDB) {
        //when no product was found -> wrong product id
        return next({
            status: 400,
            message: 'Wrong product id provided.',
        });
    }
    //delete the image to save localstorage space
    delete productFromDB['imgSrc'];

    //Update the user's shopping cart
    let user = await collectionUsers.findOne({
        email: email,
    });
    if (!user) {
        //when no user was found -> wrong email
        return next({
            status: 400,
            message: 'Wrong email provided.',
        });
    }

    let currentShoppingCart = user.shoppingCart;
    //Check if product is already inside cart
    let found = false;
    if (currentShoppingCart.length > 0) {
        for (let i = 0; i < currentShoppingCart.length; i++) {
            //Check if added product is already in cart and increase amount if yes
            if (
                ObjectId(currentShoppingCart[i][0]._id).toString() ===
                    productFromDB._id.toString() &&
                currentShoppingCart[i][0].storeId === productFromDB.storeId
            ) {
                currentShoppingCart[i][1] =
                    currentShoppingCart[i][1] + addedAmount;
                currentShoppingCart[i].splice(0, 1, productFromDB);
                found = true;
                break;
            }
        }
    }
    //add product to cart if it is not already there
    if (found === false) {
        currentShoppingCart.push([productFromDB, addedAmount]);
    }

    let result = await collectionUsers.updateOne(
        {
            //Selection criteria
            email: email,
        },
        {
            //Updated data
            $set: {
                shoppingCart: currentShoppingCart,
            },
        }
    );

    res.status(200).json({
        success: true,
        message: 'Products successfully added to cart!',
        shoppingCart: currentShoppingCart,
    });
};

const removeFromShoppingCart = async function (req, res, next) {
    let collection = await getMongoUsersCollection();
    let collectionStores = await getMongoStoresCollection();
    let collectionProducts = await getMongoProductsCollection();
    let email = req.params.email;
    let removedProduct = req.body.product;
    let removedAmount = req.body.amount;

    //Get the product from the database and save it in the shopping cart
    let store = await collectionStores.findOne({
        _id: ObjectId(removedProduct.storeId),
    });
    if (!store) {
        //when no store was found -> wrong store id in the payload
        return next({
            status: 400,
            message: 'Wrong store id provided.',
        });
    }
    //retrieve the product
    let productFromDB = await collectionProducts.findOne({
        _id: ObjectId(removedProduct._id),
    });
    if (!productFromDB) {
        //when no product was found -> wrong product id
        return next({
            status: 400,
            message: 'Wrong product id provided.',
        });
    }

    //delete the image to save localstorage space
    delete productFromDB['imgSrc'];

    let user = await collection.findOne({
        email: email,
    });
    if (!user) {
        //when no user was found -> wrong email
        return next({
            status: 400,
            message: 'Wrong email provided.',
        });
    }
    let currentShoppingCart = user.shoppingCart;

    let found = false;
    for (let i = 0; i < currentShoppingCart.length; i++) {
        //Check if added product exists in cart
        if (
            currentShoppingCart[i][0]._id.toString() ===
                productFromDB._id.toString() &&
            currentShoppingCart[i][0].storeId === productFromDB.storeId
        ) {
            currentShoppingCart[i][1] =
                currentShoppingCart[i][1] - removedAmount;
            currentShoppingCart[i].splice(0, 1, productFromDB);
            //Delete the array element if amount == 0
            if (currentShoppingCart[i][1] <= 0) {
                currentShoppingCart.splice(i, 1);
            }
            found = true;
            break;
        }
    }
    if (found === true) {
        let result = await collection.updateOne(
            {
                //Selection criteria
                email: email,
            },
            {
                //Updated data
                $set: {
                    shoppingCart: currentShoppingCart,
                },
            }
        );
        // console.log(result)
        res.status(200).json({
            success: true,
            message: 'Products successfully removed from cart!',
            shoppingCart: currentShoppingCart,
        });
    } else if (found === false) {
        return next({
            status: 400,
            message: 'Product not found in shopping cart.',
        });
    }
};

const updateShoppingCart = async function (req, res, next) {
    let collection = await getMongoUsersCollection();
    let collectionStores = await getMongoStoresCollection();
    let collectionProducts = await getMongoProductsCollection();
    let email = req.params.email;
    let shoppingCart = req.body.shoppingCart;
    //console.log(shoppingCart)

    let storeId;
    let productId;
    let payloadArray = [];
    //Run through the array, get every product from the database, push it to the payload array and save the cart to the user
    for (let i = 0; i < shoppingCart.length; i++) {
        storeId = shoppingCart[i][0].storeId;
        productId = shoppingCart[i][0]._id;

        let store = await collectionStores.findOne({
            _id: ObjectId(storeId),
        });
        if (!store) {
            //when no store was found -> wrong store id in the payload
            return next({
                status: 400,
                message: 'Wrong store id provided.',
            });
        }

        //retrieve the product
        let productFromDB = await collectionProducts.findOne({
            _id: ObjectId(productId),
        });
        if (!productFromDB) {
            //when no product was found -> wrong product id
            return next({
                status: 400,
                message: 'Wrong product id provided.',
            });
        }

        //delete the image to save localstorage space
        delete productFromDB['imgSrc'];
        payloadArray.push([productFromDB, shoppingCart[i][1]]);
    }

    //console.log(payloadArray)
    //check products in the cart array
    await collection.updateOne(
        {
            //Selection criteria
            email: email,
        },
        {
            //Updated data
            $set: {
                shoppingCart: payloadArray,
            },
        }
    );

    res.status(200).json({
        success: true,
        message: 'Cart was updated!',
    });
};

const sendTestMail = async function (req, res, next) {
    let mail = req.body.mailAddress;
    let contentType = req.body.contentType;

    let info = await sendNodemailerMail(mail, contentType);

    res.status(200).json({
        success: true,
        info: info,
    });
};

const sendPasswordResetMail = async function (req, res, next) {
    const collection = await getMongoUsersCollection();
    const email = req.body.email;
    const birthdate = req.body.birthdate;

    const findUserResult = await collection.findOne({
        email: email,
        birthdate: birthdate,
    });

    if (!findUserResult) {
        //console.log("user not found!");
        return next({
            status: 401,
            success: false,
            type: 'notFound',
            message: 'User was not found!',
        });
    }

    const resetPasswordToken = crypto
        .randomBytes(PW_RESET_TOKEN_NUM_BYTES)
        .toString('hex');
    const resetPasswordExpires = Date.now() + 3600000; //Current time in milliseconds + one hour
    console.log(resetPasswordToken);
    console.log(resetPasswordExpires);

    //save token and expire date to user
    await collection.updateOne(
        {
            email: email,
            birthdate: birthdate,
        },
        {
            $set: {
                resetPasswordToken: resetPasswordToken,
                resetPasswordExpires: resetPasswordExpires,
            },
        }
    );

    //send mail to user email
    const mailOptions = {
        email: email,
        contentType: 'resetPassword',
        resetPasswordToken: resetPasswordToken,
    };

    let mailInfo;
    try {
        mailInfo = await sendNodemailerMail(mailOptions);
    } catch (error) {
        console.log(error);
        return next({
            status: 401,
            success: false,
            type: 'whileSending',
            message: 'Error while sending!',
        });
    }

    res.status(200).json({
        success: true,
        info: mailInfo,
    });
};

const checkResetToken = async function (req, res, next) {
    const collection = await getMongoUsersCollection();
    const receivedToken = req.params.token;
    console.log(receivedToken);
    const findUserResult = await collection.findOne({
        resetPasswordToken: receivedToken,
        resetPasswordExpires: {
            $gt: Date.now(),
        },
    });

    // var findUserResultTest = await collection.findOne({
    //     'email': "TestEmail14@web.de"
    // });
    // console.log(findUserResultTest)

    console.log(findUserResult);
    if (!findUserResult) {
        //Invalid Token or expired
        return next({
            status: 401,
            type: 'invalid',
            message: 'Password reset link is invalid or has expired.',
        });
    }

    res.status(200).json({
        success: true,
        message: 'Password reset link is valid.',
    });
};

const resetPassword = async function (req, res, next) {
    const collection = await getMongoUsersCollection();
    const receivedToken = req.params.token;
    const password = req.body.password;

    // var findUserResult = await collection.findOne({
    //     resetPasswordToken: receivedToken,
    //     resetPasswordExpires: {
    //         $gt: Date.now()
    //     }
    // });
    // console.log(findUserResult)

    const updateUserResult = await collection.updateOne(
        {
            resetPasswordToken: receivedToken,
            resetPasswordExpires: {
                $gt: Date.now(),
            },
        },
        {
            $set: {
                resetPasswordToken: null,
                resetPasswordExpires: null,
                password: await bcrypt.hash(password, PW_HASH_SALT_ROUNDS),
            },
        }
    );
    console.log(updateUserResult.modifiedCount);
    if (!updateUserResult) {
        return next({
            status: 401,
            type: 'failure',
            message: 'Password reset failed.',
        });
    }

    res.status(200).json({
        success: true,
        message: 'Password successfully reset.',
    });
};

//===================================================================================================
export {
    getSingleUser,
    registerUser,
    verifyRegistration,
    loginUser,
    getAllUsers,
    updateUserInfo,
    deleteUser,
    addToShoppingCart,
    removeFromShoppingCart,
    updateShoppingCart,
    sendTestMail,
    sendPasswordResetMail,
    checkResetToken,
    resetPassword,
};
//===================================================================================================
