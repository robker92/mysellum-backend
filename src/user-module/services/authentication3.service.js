'use strict';
import { ObjectId } from 'mongodb';
// database operations
import {
    readOneOperation,
    updateOneOperation,
    updateOneAndReturnOperation,
    readManyOperation,
    deleteOneOperation,
    deleteManyOperation,
    createOneOperation,
    countDocumentsOperation,
    databaseEntity,
} from '../../storage/database-operations';
//pg
import {
    seqReadOneOperation,
    seqReadManyOperation,
    seqUpdateOperation,
    seqCreateOperation,
    seqDeleteOneOperation,
    seqReadAndCountAllOperation,
    seqDatabaseEntity,
} from '../../storage/pg/operations';
import { getNewUserData } from '../../storage/pg/models';

import {
    JWT_SECRET_KEY,
    JWT_KEY_EXPIRE,
    PW_HASH_SALT_ROUNDS,
    PW_RESET_TOKEN_NUM_BYTES,
    USER_VERIFICATION_TOKEN_EXPIRES,
} from '../../config';
import { sendNodemailerMail } from '../../mailing/nodemailer';
import { getUserModel } from '../models/user-model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// var moment = require('moment');
// import moment from 'moment';
// import moment from 'moment/src/moment';

export {
    loginUserService,
    registerUserService,
    verifyRegistrationService,
    sendPasswordResetMailService,
    checkResetTokenService,
    resetPasswordService,
};

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

function convertBirthdate(birthdate) {
    // return moment(birthdate, 'DD.MM.YYYY', true);
    return birthdate.replaceAll('-', '.');
}

async function loginUserService(email, password) {
    // Verify email address & fetch user
    const user = await seqReadOneOperation(seqDatabaseEntity.USER, {
        email: email,
    });
    if (!user) {
        throw new Error({
            type: 'incorrect',
            message: 'Combination of username and password was incorrect.',
        });
    }
    if (user.emailVerified === false) {
        throw new Error({
            type: 'verification',
            message: 'E-mail address was not verified.',
        });
    }
    if (user.blocked === true || user.deleted === true) {
        throw new Error('User can not be accessed.');
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);

    // Password does not match
    if (!match) {
        throw new Error({
            type: 'incorrect',
            message: 'Combination of username and password was incorrect.',
        });
    }

    const accessToken = createToken({
        id: user.id.toString(),
        email: user.email,
    });

    // if the user is a store owner, calculate the unfinished orders counter
    console.log(`store id: ${typeof user.ownedStoreId}`);
    // let orderCount;
    // if (user.ownedStoreId) {
    //     orderCount = await countDocumentsOperation(databaseEntity.ORDERS, {
    //         $and: [
    //             { storeId: user.ownedStoreId.toString() },
    //             { 'status.finished': false },
    //         ],
    //     });
    // }
    // console.log(`order count: ${orderCount}`);

    let counter = 0;
    for (const element of user.shoppingCart) {
        counter = counter + element[1];
    }

    // TODO
    console.log(user.favoriteStores);
    const userData = {
        user: {
            authorizationRole: 'Role1',
            email: user.email,
            name: {
                firstName: user.firstName,
                lastName: user.lastName,
            },
            ownedStoreId: user.ownedStoreId,
            shoppingCart: user.shoppingCart,
            productCounter: counter,
        },
        shoppingCart: user.shoppingCart,
        productCounter: counter,
        favoriteStores: user.favoriteStores,
        orderCount: user.ownedStoreId ? orderCount : 0,
    };
    return { accessToken, userData };
}

async function registerUserService(data) {
    const user = await seqReadOneOperation(seqDatabaseEntity.USER, {
        email: data.email,
    });
    // Email already registered
    if (user) {
        throw new Error('E-Mail already used.');
    }

    const passwordHash = await bcrypt.hash(data.password, PW_HASH_SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(PW_RESET_TOKEN_NUM_BYTES).toString('hex');
    console.log(`verification token: ${verificationToken}`);
    if (!verificationToken) {
        throw new Error('Verification token invalid.');
    }

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
        verificationExpires: Date.now() + USER_VERIFICATION_TOKEN_EXPIRES, //Date now + 60min
        datetimeCreated: new Date().toISOString(),
    };
    // const userData = getUserModel(options);
    const userData = getNewUserData(options);

    // Create the user
    const insertResult = await seqCreateOperation(seqDatabaseEntity.USER, userData);
    if (!insertResult) {
        throw new Error('Could not create user.');
    }

    //send email confirmation mail
    const mailOptions = {
        email: data.email,
        contentType: 'registrationVerification',
        verificationToken: verificationToken,
    };

    // try {
    //     await sendNodemailerMail(mailOptions);
    // } catch (error) {
    //     // TODO User is created, but no mail is sent...
    //     console.log(error);
    //     throw new Error('Error while sending confirmation mail.');
    // }

    return;
}

async function verifyRegistrationService(verificationToken) {
    console.log(verificationToken);
    const whereObject = {
        verifyRegistrationToken: verificationToken,
        // verifyRegistrationExpires: {
        //     $gt: Date.now(), // TODO -> Seq
        // },
    };
    const valueObject = {
        verifyRegistrationToken: null,
        verifyRegistrationExpires: null,
        emailVerified: true,
    };

    let user;
    try {
        user = await seqUpdateOperation(databaseEntity.USERS, valueObject, whereObject);
    } catch (error) {
        console.log(error);
        throw new Error(`Update operation during E-Mail verification failed using the token ${verificationToken}.`);
    }
    console.log(user);
    const accessToken = createToken({
        id: user.id.toString(),
        email: user.email,
    });

    console.log(user.favoriteStores);
    const userData = {
        user: {
            authorizationRole: 'Role1',
            email: user.email,
            name: {
                firstName: user.firstName,
                lastName: user.lastName,
            },
            ownedStoreId: '',
            shoppingCart: [],
            productCounter: 0,
        },
        shoppingCart: user.shoppingCart,
        favoriteStores: user.favoriteStores ?? [],
        // productCounter: counter
    };

    return { accessToken, userData };
}

async function sendPasswordResetMailService(email, birthdate) {
    console.log(email);
    console.log(birthdate);
    console.log(convertBirthdate(birthdate));
    birthdate = convertBirthdate(birthdate);
    const user = await seqReadOneOperation(seqDatabaseEntity.USER, {
        email: email,
        birthdate: birthdate,
    });
    if (!user) {
        console.log(`User not found`);
        throw new Error(`A user with the email address '${email}' and birthdate '${birthdate}' was not found.`);
    }

    const resetPasswordToken = crypto.randomBytes(PW_RESET_TOKEN_NUM_BYTES).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000; // Current time in milliseconds + one hour
    console.log(resetPasswordToken);
    console.log(resetPasswordExpires);

    //save token and expire date to user
    const updateResult = await seqUpdateOperation(
        seqDatabaseEntity.USER,
        {
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpires: resetPasswordExpires,
        },
        {
            email: email,
            birthdate: birthdate,
        }
    );
    if (!updateResult) {
        throw new Error(`Error during update operation.`);
    }

    //send mail to user email
    const mailOptions = {
        email: email,
        contentType: 'resetPassword',
        resetPasswordToken: resetPasswordToken,
    };

    let mailInfo;
    // try {
    //     mailInfo = await sendNodemailerMail(mailOptions);
    // } catch (error) {
    //     console.log(error);
    //     throw {
    //         status: 500,
    //         type: 'whileSending',
    //         message: 'Error while sending!',
    //     };
    // }

    return mailInfo;
}

async function checkResetTokenService(receivedToken) {
    const user = await readOneOperation(databaseEntity.USERS, {
        resetPasswordToken: receivedToken,
        resetPasswordExpires: {
            $gt: Date.now(),
        },
    });
    if (!user) {
        //Invalid Token or expired
        throw {
            status: 500,
            type: 'invalid',
            message: 'Password reset link is invalid or has expired.',
        };
    }

    return;
}

async function resetPasswordService(receivedToken, password) {
    const passwordHash = await bcrypt.hash(password, PW_HASH_SALT_ROUNDS);

    await updateOneOperation(
        databaseEntity.USERS,
        {
            resetPasswordToken: receivedToken,
            resetPasswordExpires: {
                $gt: Date.now(),
            },
        },
        {
            resetPasswordToken: null,
            resetPasswordExpires: null,
            password: passwordHash,
        },
        'set'
    );

    return;
}
