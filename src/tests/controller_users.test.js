//Sources: 
//https://dev.to/nedsoft/testing-nodejs-express-api-with-jest-and-supertest-1km6
//https://jestjs.io/docs/en/mongodb
//https://jestjs.io/docs/en/expect

// const moxios = require("moxios"); //library would be needed to mock api calls to other systems
const mongodb = require('../mongodb');
//const config = require('../config');
const api = require('../api');
const request = require("supertest"); //library to send test api calls to this system

//Group of tests
describe('Register User Tests', () => {
    beforeAll(async () => {
        await mongodb.connectClient();
    });

    afterAll(async () => {
        await mongodb.disconnectClient();
    });

    //single test. it = synonym for "test" (function)
    it('should return a user', async () => {

        const res = await request(api)
            .get('/users/TestEmail14@web.de')

        console.log(res.body)
        expect(res.body.email).toEqual("TestEmail14@web.de")

        //expect(res.body).toHaveProperty('post')
    });

    //single test. it = synonym for "test" (function)
    it('should return Validation Failed', async () => {
        let payload = {
            "email": "Test@web.de",
            "password": "Test",
            "firstName": "Test",
            "lastName": "Test",
            "birthDate": "01.01.2011",
            "city": "Test",
            "postcode": "Test",
            "addressLine1": "Test"
        };

        const res = await request(api)
            .post('/users/registerUser')
            .send(payload);

        expect(res.body.message).toEqual("Validation Failed");
    });

    it('should result in successfull registration', async () => {
        let payload = {
            "email": "Test@web.de",
            "password": "Test1aaa!",
            "firstName": "Test",
            "lastName": "Test",
            "birthDate": "01.01.2011",
            "city": "Test",
            "postcode": "11111",
            "addressLine1": "Test"
        };

        const res = await request(api)
            .post('/users/registerUser')
            .send(payload);

        expect(res.body.message).toEqual("Registration successful!");
    });
});

describe('Sample Test', () => {
    it('should test that true === true', () => {
        expect(true).toBe(true)
    });
});