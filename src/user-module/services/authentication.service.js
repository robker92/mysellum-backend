'use strict';

import { USER_MODULE_PUBLIC_ERRORS } from '../utils/errors';
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
// MongoDB transaction
import { getMongoDbClient, getMongoDbTransactionWriteOptions } from '../../storage/mongodb/setup';

//pg
// import {
//     seqReadOneOperation,
//     seqReadManyOperation,
//     seqUpdateOperation,
//     seqCreateOperation,
//     seqDeleteOneOperation,
//     seqReadAndCountAllOperation,
// } from '../../storage/pg/operations';

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

function createPasswordSalt() {
    const salt = crypto.randomBytes(128).toString('base64');

    return salt;
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
        throw USER_MODULE_PUBLIC_ERRORS.AUTH_WRONG_CREDENTIALS;
    }
    if (user.emailVerified === false) {
        throw USER_MODULE_PUBLIC_ERRORS.EMAIL_NOT_VERIFIED;
    }
    if (user.blocked === true || user.deleted === true) {
        throw USER_MODULE_PUBLIC_ERRORS.USER_BLOCKED_OR_DELETED;
    }

    console.log(user.passwordSalt);
    console.log(password);
    console.log(user.password);

    // Verify password
    const match = await bcrypt.compare(`${password}${user.passwordSalt}`, `${user.password}`);

    // Password does not match
    if (!match) {
        throw USER_MODULE_PUBLIC_ERRORS.AUTH_WRONG_CREDENTIALS;
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
            $and: [{ storeId: user.ownedStoreId.toString() }, { 'status.finished': false }],
        });
        console.log(`order count: ${orderCount}`);
    }

    let productCounter = 0;
    for (const element of user.shoppingCart) {
        productCounter = productCounter + element[1];
    }

    const userData = getReturnUserObj(user, productCounter, orderCount);

    // TODO
    // const userData = {
    //     user: {
    //         email: user.email,
    //         name: {
    //             firstName: user.firstName,
    //             lastName: user.lastName,
    //         },
    //         ownedStoreId: user.ownedStoreId,
    //         shoppingCart: user.shoppingCart,
    //         productCounter: productCounter,
    //     },
    //     shoppingCart: user.shoppingCart,
    //     productCounter: productCounter,
    //     favoriteStores: user.favoriteStores,
    //     orderCount: user.ownedStoreId ? orderCount : 0,
    // };

    return { accessToken, userData };
}

function getReturnUserObj(user, productCounter, orderCount) {
    const userData = {
        user: {
            email: user.email,
            name: {
                firstName: user.firstName,
                lastName: user.lastName,
            },
            ownedStoreId: user.ownedStoreId,
            shoppingCart: user.shoppingCart,
            productCounter: productCounter,
        },
        shoppingCart: user.shoppingCart,
        productCounter: productCounter,
        favoriteStores: user.favoriteStores,
        orderCount: user.ownedStoreId ? orderCount : 0,
    };

    return userData;
}

function createVerificationToken() {
    const verificationToken = crypto.randomBytes(PW_RESET_TOKEN_NUM_BYTES).toString('hex');
    if (!verificationToken) {
        throw USER_MODULE_PUBLIC_ERRORS.REGISTRATION_UNSUCCESSFUL;
    }
    return verificationToken;
}

async function registerUserService(data) {
    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            const user = await readOneOperation(
                databaseEntity.USERS,
                {
                    email: data.email,
                },
                {},
                session
            );
            // Email already registered
            if (user) {
                throw USER_MODULE_PUBLIC_ERRORS.EMAIL_ALREADY_USED;
            }

            const passwordSalt = createPasswordSalt();
            const valueToBeHashed = `${data.password}${passwordSalt}`;
            const passwordHash = await bcrypt.hash(valueToBeHashed, PW_HASH_SALT_ROUNDS);
            const verificationToken = createVerificationToken();

            // get user data model function
            const options = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                passwordHash: passwordHash,
                passwordSalt: passwordSalt,
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
            const insertResult = await createOneOperation(databaseEntity.USERS, userData, session);
            if (!insertResult) {
                throw USER_MODULE_PUBLIC_ERRORS.REGISTRATION_UNSUCCESSFUL;
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
                console.log(error);
                throw USER_MODULE_PUBLIC_ERRORS.DEFAULT;
            }
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
    }

    console.log(`User registered`);

    return;
}

async function verifyRegistrationService(verificationToken) {
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
        user = await updateOneAndReturnOperation(databaseEntity.USERS, queryObject, updateObject, 'set');
    } catch (error) {
        console.log(error);
        throw USER_MODULE_PUBLIC_ERRORS.DEFAULT;
    }

    if (!user) {
        throw USER_MODULE_PUBLIC_ERRORS.DEFAULT;
    }

    const accessToken = createToken({
        id: user._id.toString(),
        email: user.email,
    });

    const userData = getReturnUserObj(user, 0, 0);

    // const userData = {
    //     message: 'Registration successful!',
    //     user: {
    //         authorizationRole: 'Role1',
    //         email: user.email,
    //         name: {
    //             firstName: user.firstName,
    //             lastName: user.lastName,
    //         },
    //         ownedStoreId: '',
    //         shoppingCart: [],
    //         productCounter: 0,
    //     },
    //     shoppingCart: user.shoppingCart,
    //     favoriteStores: user.favoriteStores ?? [],
    //     // productCounter: counter
    // };

    return { accessToken, userData };
}

async function resendVerificationEmailService(email, birthdate) {
    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            const user = await readOneOperation(
                databaseEntity.USERS,
                {
                    email: email,
                },
                {},
                session
            );
            if (!user) {
                throw USER_MODULE_PUBLIC_ERRORS.USER_NOT_FOUND;
            }

            if (user.birthdate !== birthdate || user.deleted === true || user.blocked === true) {
                throw USER_MODULE_PUBLIC_ERRORS.USER_BLOCKED_OR_DELETED;
            }

            if (user.emailVerified === true) {
                throw USER_MODULE_PUBLIC_ERRORS.EMAIL_ALREADY_VERIFIED;
            }

            // update token and expiration date
            const verificationToken = createVerificationToken();
            await updateOneOperation(
                databaseEntity.USERS,
                { email: email },
                {
                    verifyRegistrationToken: verificationToken,
                    verifyRegistrationExpires: Date.now() + USER_VERIFICATION_TOKEN_EXPIRES, //Date now + 60min
                },
                'set',
                session
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
                throw USER_MODULE_PUBLIC_ERRORS.DEFAULT;
            }
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
    }

    return;
}

async function sendPasswordResetMailService(email, birthdate) {
    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            birthdate = convertBirthdate(birthdate);
            const user = await readOneOperation(
                databaseEntity.USERS,
                {
                    email: email,
                    birthdate: birthdate,
                },
                {},
                session
            );
            if (!user) {
                throw USER_MODULE_PUBLIC_ERRORS.USER_NOT_FOUND;
            }

            const resetPasswordToken = crypto.randomBytes(PW_RESET_TOKEN_NUM_BYTES).toString('hex');
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
                'set',
                session
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
                throw USER_MODULE_PUBLIC_ERRORS.DEFAULT;
            }
            console.log(mailInfo);
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
    }
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
        throw USER_MODULE_PUBLIC_ERRORS.RESET_LINK_INVALID_OR_EXPIRED;
    }

    return;
}

async function resetPasswordService(receivedToken, password) {
    const passwordSalt = createPasswordSalt();
    const valueToBeHashed = `${password}${passwordSalt}`;
    const passwordHash = await bcrypt.hash(valueToBeHashed, PW_HASH_SALT_ROUNDS);

    try {
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
                passwordSalt: passwordSalt,
            },
            'set'
        );
    } catch (error) {
        throw USER_MODULE_PUBLIC_ERRORS.DEFAULT;
    }

    return;
}

// const session = getMongoDbClient().startSession();
// try {
//     await session.withTransaction(async () => {}, getMongoDbTransactionWriteOptions());
// } catch (error) {
//     console.log('The transaction was aborted due to an unexpected error: ');
//     console.log(error);
//     throw error;
// } finally {
//     await session.endSession();
// }
