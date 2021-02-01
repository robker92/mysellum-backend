"use strict";
import dotenv from 'dotenv'
dotenv.config()

//Configuration variables
const PORT = process.env.PORT || '3000';
//MongoDB
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const MONGODB_NAME = process.env.NODE_ENV !== "test" ? process.env.MONGODB_NAME_DEV : process.env.MONGODB_NAME_TEST;
//const MONGODB_NAME = process.env.JEST_WORKER_ID === undefined ? process.env.MONGODB_NAME_DEV : process.env.MONGODB_NAME_TEST;
console.log(MONGODB_NAME)

//JWT
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'very secret secret';
const JWT_KEY_EXPIRE = process.env.BCRYPT_KEY_EXPIRES_IN || '7d';

//BCrypt & Token

//Password Hash BCrypt
const PW_HASH_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 11;

//password reset crypto
const PW_RESET_TOKEN_NUM_BYTES = parseInt(process.env.CRYPTO_RESET_TOKEN_NUM_BYTES) || 40;

//Nodemailer
const MAIL_USER = process.env.MAIL_USER || 'AwesomeCompany@gmx.de';
const MAIL_PW = process.env.MAIL_PASS || 'ThisIsAwesome1-';

//Body Parser limits
const JSON_LIMIT = process.env.BP_JSON_LIMIT || '50mb'; // store max 10 images => 4mbx10 = 40mb; + puffer
const URL_ENCODED_LIMIT = process.env.BP_URL_ENCODED_LIMIT || '50mb';
const MULTER_LIMIT = parseInt(process.env.MULTER_LIMIT) || 4000000; //4mb

//=============================================================================
export { PORT, MONGODB_URL,MONGODB_NAME,JWT_SECRET_KEY,JWT_KEY_EXPIRE,
    PW_HASH_SALT_ROUNDS,PW_RESET_TOKEN_NUM_BYTES,MAIL_USER,
    MAIL_PW,JSON_LIMIT,URL_ENCODED_LIMIT, MULTER_LIMIT };
//=============================================================================