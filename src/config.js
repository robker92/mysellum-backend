"use strict";

//Configuration variables
const port = process.env.PORT || '3000';
const mongoURL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const JwtSecret = process.env.JWT_SECRET || 'very secret secret';
const mongodb_name = process.env.JEST_WORKER_ID === undefined ? 'testdatabase' : 'testdatabaseTests';
const saltRounds = 11;
const keyExpiresIn = "24h";
const secretKey = '123456789';

module.exports = {
    port,
    mongoURL,
    JwtSecret,
    mongodb_name,
    saltRounds,
    keyExpiresIn,
    secretKey
};