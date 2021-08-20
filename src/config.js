'use strict';
import dotenv from 'dotenv';
dotenv.config();

// Configuration variables
const PORT = process.env.PORT || '3000';

// MongoDB
const MONGODB_URL =
    process.env.MONGODB_URL ||
    'mongodb://localhost:27017,localhost:30001/testdatabase?replSet=rs0';
const MONGODB_NAME =
    process.env.NODE_ENV !== 'test'
        ? process.env.MONGODB_NAME_DEV
        : process.env.MONGODB_NAME_TEST;

const COSMOSDB_URL =
    'mongodb://prjct-database:vRW4XEoblHbcmGdMDadRwXUgWqEElr6bxc4osxuUWIceaXYyK9toVk4KIvf4FlFLwUWR8dRwDE3MXvowYDbkxw%3D%3D@prjct-database.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@prjct-database@';
const COSMOSDB_DB_DEV_NAME = process.env.COSMOSDB_DB_DEV_NAME;
const COSMOSDB_DB_TEST_NAME = process.env.COSMOSDB_DB_TEST_NAME;
const COSMOSDB_DB_PROD_NAME = process.env.COSMOSDB_DB_PROD_NAME;

let COSMOSDB_NAME;
if (process.env.NODE_ENV === 'development') {
    COSMOSDB_NAME = COSMOSDB_DB_DEV_NAME;
} else if (process.env.NODE_ENV === 'production') {
    COSMOSDB_NAME = COSMOSDB_DB_PROD_NAME;
} else {
    COSMOSDB_NAME = COSMOSDB_DB_TEST_NAME;
}
console.log(COSMOSDB_NAME);

// PG
let PG_DB_NAME;
let PG_DB_ADMIN_NAME;
let PG_DB_PW;
let PG_DB_HOST;
let PG_DB_PORT;
if (process.env.NODE_ENV === 'development') {
    PG_DB_NAME = process.env.PG_DB_DEV_NAME;
    PG_DB_ADMIN_NAME = process.env.PG_DB_DEV_ADMIN_NAME;
    PG_DB_PW = process.env.PG_DB_DEV_PW;
    PG_DB_HOST = process.env.PG_DB_DEV_HOST;
    PG_DB_PORT = process.env.PG_DB_DEV_PORT;
} else {
    PG_DB_NAME = process.env.PG_DB_PROD_NAME;
    PG_DB_ADMIN_NAME = process.env.PG_DB_PROD_ADMIN_NAME;
    PG_DB_PW = process.env.PG_DB_PROD_PW;
    PG_DB_HOST = process.env.PG_DB_PROD_HOST;
    PG_DB_PORT = process.env.PG_DB_PROD_PORT;
}

// JWT
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'very secret secret';
const JWT_KEY_EXPIRE = process.env.BCRYPT_KEY_EXPIRES_IN || '7d';

const USER_VERIFICATION_TOKEN_EXPIRES = parseInt(
    process.env.USER_VERIFICATION_TOKEN_EXPIRES
);

// Password Hash BCrypt
const PW_HASH_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 11;

// Password reset crypto
const PW_RESET_TOKEN_NUM_BYTES =
    parseInt(process.env.CRYPTO_RESET_TOKEN_NUM_BYTES) || 40;

// Nodemailer
const MAIL_HOST = process.env.MAIL_HOST || 'mail.gmx.net';
const MAIL_USER = process.env.MAIL_USER || 'AwesomeCompany@gmx.de';
const MAIL_PW = process.env.MAIL_PASS || 'ThisIsAwesome1-';
const MAIL_INTERNAL_CUSTOMER_SUPPORT =
    process.env.MAIL_INTERNAL_CUSTOMER_SUPPORT || 'rkerscher@gmx.de';

// Body Parser limits
const JSON_LIMIT = process.env.BP_JSON_LIMIT || '50mb'; // store max 10 images => 4mbx10 = 40mb; + puffer
const URL_ENCODED_LIMIT = process.env.BP_URL_ENCODED_LIMIT || '50mb';
const MULTER_LIMIT = parseInt(process.env.MULTER_LIMIT) || 4000000; //4mb

// Paypal
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BN_CODE = process.env.PAYPAL_BN_CODE; // also called Attribution Id
const PAYPAL_REF_ID_HASH_NUM_BYTES = parseInt(
    process.env.PAYPAL_REF_ID_HASH_NUM_BYTES
);
const PAYPAL_PLATFORM_MERCHANT_ID = process.env.PAYPAL_PLATFORM_MERCHANT_ID;
const PAYPAL_PLATFORM_EMAIL = process.env.PAYPAL_PLATFORM_EMAIL;

// URLs
const FRONTEND_BASE_URL_PROD = process.env.FRONTEND_BASE_URL_PROD;
let FRONTEND_BASE_URL;
if (process.env.NODE_ENV === 'production') {
    FRONTEND_BASE_URL = FRONTEND_BASE_URL_PROD;
} else {
    FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL_DEV;
}
let BACKEND_BASE_URL;
if (process.env.NODE_ENV === 'production') {
    BACKEND_BASE_URL = process.env.BACKEND_BASE_URL_PROD;
} else {
    BACKEND_BASE_URL = process.env.BACKEND_BASE_URL_DEV;
}

//=============================================================================
export {
    PORT,
    MONGODB_URL,
    MONGODB_NAME,
    COSMOSDB_URL,
    COSMOSDB_NAME,
    PG_DB_NAME,
    PG_DB_ADMIN_NAME,
    PG_DB_PW,
    PG_DB_HOST,
    PG_DB_PORT,
    JWT_SECRET_KEY,
    JWT_KEY_EXPIRE,
    USER_VERIFICATION_TOKEN_EXPIRES,
    PW_HASH_SALT_ROUNDS,
    PW_RESET_TOKEN_NUM_BYTES,
    MAIL_HOST,
    MAIL_USER,
    MAIL_PW,
    MAIL_INTERNAL_CUSTOMER_SUPPORT,
    JSON_LIMIT,
    URL_ENCODED_LIMIT,
    MULTER_LIMIT,
    PAYPAL_BASE_URL,
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    PAYPAL_BN_CODE,
    PAYPAL_REF_ID_HASH_NUM_BYTES,
    PAYPAL_PLATFORM_MERCHANT_ID,
    PAYPAL_PLATFORM_EMAIL,
    FRONTEND_BASE_URL_PROD, // also exported, because sometimes we need the prod url during dev as well
    FRONTEND_BASE_URL,
    BACKEND_BASE_URL,
};
//=============================================================================
