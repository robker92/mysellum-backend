//Sources: 
//https://dev.to/nedsoft/testing-nodejs-express-api-with-jest-and-supertest-1km6
//https://jestjs.io/docs/en/mongodb
//https://jestjs.io/docs/en/expect

// const moxios = require("moxios"); //library would be needed to mock api calls to other systems
const mongodb = require('../mongodb');
//const config = require('../config');
const config = require('../config');

const nodemailer = require('../mailing/nodemailer');
//const sendMail = nodemailer.sendMail();
jest.mock('nodemailer');
// const mailTransporter = require('../mailing/mailTransporter.js');
// jest.mock('mailTransporter', () => jest.fn());

const api = require('../api');
const request = require("supertest"); //library to send test api calls to this system

//Group of tests
describe('Register User Tests', () => {
    let email = "TestEmail1@web.de";
    let password = "Test1aaa!";

    beforeAll(async () => {
        await mongodb.connectClient();
    });

    afterAll(async () => {
        let userCollection = mongodb.getClient().db(config.mongodb_name).collection("users");
        await userCollection.remove({});
        await mongodb.disconnectClient();
    });

    // //single test. it = synonym for "test" (function)
    // it('should return a user', async () => {

    //     const res = await request(api)
    //         .get('/users/TestEmail14@web.de')

    //     //console.log(res.body)
    //     expect(res.body.email).toEqual("TestEmail14@web.de")

    //     //expect(res.body).toHaveProperty('post')
    // });

    it('should return Validation Failed', async () => {
        let payload = {
            "email": email,
            "password": "Test", //should not validate
            "firstName": "Test",
            "lastName": "Test",
            "birthdate": "01.01.2011",
            "city": "Test",
            "postcode": "Test",
            "addressLine1": "Test"
        };

        const res = await request(api)
            .post('/users/registerUser')
            .send(payload);

        //expect(res.body.details[0].context.key).toEqual("password"); //Get error details of validation error
        expect(res.body.details[0]).toHaveProperty("password"); //Check if first element of error array has key password
    });

    it('should result in successfull registration', async () => {
        nodemailer.sendMail = jest.fn().mockReturnValue('');

        let payload = {
            "email": email,
            "password": password,
            "firstName": "Test",
            "lastName": "Test",
            "birthdate": "01.01.2011",
            "city": "Test",
            "postcode": "11111",
            "addressLine1": "Teststreet 1"
        };

        const res = await request(api)
            .post('/users/registerUser')
            .send(payload);
        //console.log(res.body)
        expect(res.status).toEqual(200);
    });

    it('verify the registration with wrong token', async () => {
        nodemailer.sendMail = jest.fn().mockReturnValue('');
        const res = await request(api)
            .post(`/users/verifyRegistration/aaa`);
        //console.log(res)
        expect(res.status).toEqual(401);
    });

    it('verify the registration', async () => {
        nodemailer.sendMail = jest.fn().mockReturnValue('');

        let userCollection = mongodb.getClient().db(config.mongodb_name).collection("users");
        let user = await userCollection.findOne({
            'email': email
        });
        //console.log(user)
        const res = await request(api)
            .post(`/users/verifyRegistration/${user.verifyRegistrationToken}`);
        //console.log(res)
        expect(res.status).toEqual(200);
    });

    it('login the user', async () => {
        const res = await request(api)
            .post(`/users/loginUser`)
            .send({
                email: email,
                password: password
            });
        //console.log(res)
        expect(res.status).toEqual(200);
    });

    it('login with wrong password', async () => {
        const res = await request(api)
            .post(`/users/loginUser`)
            .send({
                email: email,
                password: "anythingA!0"
            });
        //console.log(res)
        expect(res.status).toEqual(401);
    });

    it('login with wrong email', async () => {
        const res = await request(api)
            .post(`/users/loginUser`)
            .send({
                email: "email@web.de",
                password: password
            });
        //console.log(res)
        expect(res.status).toEqual(401);
    });
});

describe('Login User Tests', () => {
    beforeAll(async () => {
        await mongodb.connectClient();
    });

    afterAll(async () => {
        await mongodb.disconnectClient();
    });

    //Wrong user name
    //wrong password
    //Correct credentials
});

//Stories:
//Update user info
//Delete user
//SHopping Cart
//Add
//Remove

// Password reset
// sendPasswordResetMail
// checkResetToken
// resetPassword

describe('Sample Test', () => {
    it('should test that true === true', () => {
        expect(true).toBe(true)
    });
});