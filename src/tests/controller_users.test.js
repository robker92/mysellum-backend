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
describe('Get Single User', () => {
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
});

describe('Sample Test', () => {
    it('should test that true === true', () => {
        expect(true).toBe(true)
    });
});