"use strict";

import api from "../src/api";
import request from 'supertest';
import {getMongoPrdctNotifCollection} from "../src/mongodb/collections";
import {rgstrPrdctAvNotif} from "../src/mongodb/collections";
import {
    StatusCodes
} from 'http-status-codes';


describe('Register User Tests', () => {
    let email = "TestEmail1@web.de";
    let password = "Test1aaa!";
    beforeAll(async function () {
        await connectMongoDBClient();
        const collection = await getMongoPrdctNotifCollection();
        await collection.deleteMany();
    });
    afterAll(async function () {
        const collection = await getMongoPrdctNotifCollection();
        await collection.deleteMany();
        disconnectMongoDBClient();
    }); // //single test. it = synonym for "test" (function)

  it('Register a product availability notification', async function () {
        let payload = {
            "email": email,
            "storeId": "Test",
            "productId": "Test"
        };
        let res = await request(api).post('/rgstrPrdctAvNotif').send(payload); //expect(res.body.details[0].context.key).toEqual("password"); //Get error details of validation error


        expect(res.body.details[0]).toHaveProperty("password"); //Check if first element of error array has key password
    });

});