"use strict";

//Configuration variables
const port = process.env.PORT || '3000';
//MongoDB
const mongoURL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const JwtSecret = process.env.JWT_SECRET || 'very secret secret';
const mongodb_name = process.env.JEST_WORKER_ID === undefined ? 'testdatabase' : 'testdatabaseTests';

//BCrypt & Token
const saltRounds = 11;
const keyExpiresIn = "24h";
//const keyExpiresIn = "100";
const secretKey = "123456789";

//crypto - password reset
const resetToken_numBytes = 40;


//Nodemailer
const mailUser = "AwesomeCompany@gmx.de";
const mailPass = "ThisIsAwesome1-";

module.exports = {
    port,
    mongoURL,
    JwtSecret,
    mongodb_name,
    saltRounds,
    keyExpiresIn,
    secretKey,
    resetToken_numBytes,
    mailUser,
    mailPass
};