'use strict';

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
} from '../../storage/pg/operations';

import {
    JWT_SECRET_KEY,
    JWT_KEY_EXPIRE,
    PW_HASH_SALT_ROUNDS,
    PW_RESET_TOKEN_NUM_BYTES,
    USER_VERIFICATION_TOKEN_EXPIRES,
} from '../../config';
import { sendNodemailerMail } from '../../mailing/nodemailer';
import { getUserModel } from '../../data-models';
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
    resendVerificationEmailService,
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
    // return birthdate.replaceAll('-', '.');
    // return birthdate.replaceAll('-', '.');
    return birthdate.replace(/-/g, '.');
}

async function loginUserService(email, password) {
    // Verify email address & fetch user
    const user = await readOneOperation(databaseEntity.USERS, {
        email: email,
    });
    if (!user) {
        // throw new Error('Combination of username and password was incorrect.');
        throw {
            status: 401,
            type: 'incorrect',
            message: 'Combination of username and password was incorrect.',
        };
    }
    if (user.emailVerified === false) {
        // throw new Error('E-mail address was not verified.');
        throw {
            status: 401,
            type: 'verification',
            message: 'E-mail address was not verified.',
        };
    }
    if (user.blocked === true || user.deleted === true) {
        // throw new Error('User can not be accessed.');
        throw {
            status: 401,
            type: 'unauthorized',
            message: 'User can not be accessed.',
        };
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);

    // Password does not match
    if (!match) {
        // throw new Error('Combination of username and password was incorrect.');
        throw {
            status: 401,
            type: 'incorrect',
            message: 'Combination of username and password was incorrect.',
        };
    }

    const accessToken = createToken({
        id: user._id.toString(),
        email: user.email,
    });

    // if the user is a store owner, calculate the unfinished orders counter
    console.log(`store id: ${typeof user.ownedStoreId}`);
    let orderCount;
    if (user.ownedStoreId) {
        orderCount = await countDocumentsOperation(databaseEntity.ORDERS, {
            $and: [
                { storeId: user.ownedStoreId.toString() },
                { 'status.finished': false },
            ],
        });
    }
    console.log(`order count: ${orderCount}`);

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

function createVerificationToken() {
    const verificationToken = crypto
        .randomBytes(PW_RESET_TOKEN_NUM_BYTES)
        .toString('hex');
    if (!verificationToken) {
        throw {
            status: 401,
            message: 'Verification token invalid.',
        };
    }
    return verificationToken;
}

async function registerUserService(data) {
    const user = await readOneOperation(databaseEntity.USERS, {
        email: data.email,
    });
    // Email already registered
    if (user) {
        throw {
            status: 401,
            type: 'alreadyUsed',
            message: 'E-Mail already used.',
        };
        // throw new Error(`The e-mail ${data.email} is already registered.`);
    }

    const passwordHash = await bcrypt.hash(data.password, PW_HASH_SALT_ROUNDS);
    const verificationToken = createVerificationToken();
    // const verificationToken = crypto
    //     .randomBytes(PW_RESET_TOKEN_NUM_BYTES)
    //     .toString('hex');
    // if (!verificationToken) {
    //     throw {
    //         status: 401,
    //         message: 'Verification token invalid.',
    //     };
    // }

    // get user data model function
    const options = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash: passwordHash,
        city: data.city,
        postcode: data.postcode,
        addressLine1: data.addressLine1,
        birthdate: data.birthdate,
        verificationToken: verificationToken,
        verificationExpires: Date.now() + USER_VERIFICATION_TOKEN_EXPIRES, //Date now + 60min
        datetimeCreated: new Date().toISOString(),
    };
    const userData = getUserModel(options);

    // Create the user
    const insertResult = await createOneOperation(
        databaseEntity.USERS,
        userData
    );
    if (!insertResult) {
        throw {
            status: 500,
            type: 'failed',
            message: 'Registration failed!',
        };
    }
    // const createdUser = insertResult.ops[0];

    //send email verification e-mail
    const mailOptions = {
        email: data.email,
        contentType: 'registrationVerification',
        verificationToken: verificationToken,
    };

    try {
        await sendNodemailerMail(mailOptions);
    } catch (error) {
        // TODO User is created, but no mail is sent...
        console.log(error);
        throw {
            status: 500,
            type: 'whileMailSending',
            message: 'Error while sending!',
        };
    }

    return;
}

async function verifyRegistrationService(verificationToken) {
    console.log(verificationToken);
    const queryObject = {
        verifyRegistrationToken: verificationToken,
        verifyRegistrationExpires: {
            $gt: Date.now(),
        },
    };
    const updateObject = {
        verifyRegistrationToken: null,
        verifyRegistrationExpires: null,
        emailVerified: true,
    };

    let user;
    try {
        user = await updateOneAndReturnOperation(
            databaseEntity.USERS,
            queryObject,
            updateObject,
            'set'
        );
    } catch (error) {
        console.log(error);
        throw {
            status: 500,
            type: 'verification',
            message: 'E-Mail verification failed.',
        };
    }
    console.log(`hi1`);
    console.log(user);
    if (!user) {
        throw {
            status: 500,
            type: 'verification',
            message: 'E-Mail verification failed.',
        };
    }

    console.log(user);
    const accessToken = createToken({
        id: user._id.toString(),
        email: user.email,
    });

    console.log(user.favoriteStores);
    const userData = {
        message: 'Registration successful!',
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

async function resendVerificationEmailService(email, birthdate) {
    const user = await readOneOperation(databaseEntity.USERS, {
        email: email,
    });
    if (!user) {
        throw {
            status: 400,
            type: 'emailUnknown',
            message: `The e-mail ${email} is not registered yet.`,
        };
    }
    console.log(user.birthdate);
    if (
        user.birthdate !== birthdate ||
        user.deleted === true ||
        user.blocked === true
    ) {
        throw {
            status: 400,
            type: 'unauthorized',
            message: `The user is not allowed to request a new verification e-mail.`,
        };
    }
    if (user.emailVerified === true) {
        throw {
            status: 400,
            type: 'alreadyVerified',
            message: `The user's e-mail ${email} is already verified.`,
        };
    }

    // update token and expiration date
    const verificationToken = createVerificationToken();
    await updateOneOperation(
        databaseEntity.USERS,
        { email: email },
        {
            verifyRegistrationToken: verificationToken,
            verifyRegistrationExpires:
                Date.now() + USER_VERIFICATION_TOKEN_EXPIRES, //Date now + 60min
        }
    );
    //send email verification e-mail
    const mailOptions = {
        email: email,
        contentType: 'registrationVerification',
        verificationToken: verificationToken,
    };

    try {
        await sendNodemailerMail(mailOptions);
    } catch (error) {
        // TODO User is updated, but no mail is sent...
        console.log(error);
        throw {
            status: 500,
            type: 'whileMailSending',
            message: 'Error while sending!',
        };
    }

    return;
}

async function sendPasswordResetMailService(email, birthdate) {
    console.log(email);
    console.log(birthdate);
    console.log(convertBirthdate(birthdate));
    birthdate = convertBirthdate(birthdate);
    const user = await readOneOperation(databaseEntity.USERS, {
        email: email,
        birthdate: birthdate,
    });
    if (!user) {
        console.log(`User not found`);
        throw {
            status: 500,
            type: 'notFound',
            message: 'User was not found!',
        };
    }

    const resetPasswordToken = crypto
        .randomBytes(PW_RESET_TOKEN_NUM_BYTES)
        .toString('hex');
    const resetPasswordExpires = Date.now() + 3600000; //Current time in milliseconds + one hour
    console.log(resetPasswordToken);
    console.log(resetPasswordExpires);

    //save token and expire date to user
    await updateOneOperation(
        databaseEntity.USERS,
        {
            email: email,
            birthdate: birthdate,
        },
        {
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpires: resetPasswordExpires,
        },
        'set'
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
        throw {
            status: 500,
            type: 'whileSending',
            message: 'Error while sending!',
        };
    }

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
