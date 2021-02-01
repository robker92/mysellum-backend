"use strict";

import api from "../api";
import request from 'supertest';
import {getMongoUsersCollection} from "../mongodb/collections";
import {
    StatusCodes
} from 'http-status-codes';

import {connectMongoDBClient, disconnectMongoDBClient, getClient} from "../mongodb/setup"

import {sendNodemailerMail} from "../mailing/nodemailer"
jest.mock('../mailing/nodemailer', () => ({
    sendNodemailerMail: jest.fn()
}))
//Mocking:
// jest.mock('../dependency');
// // If necessary, you can place a mock implementation like this:
// dependency.mockImplementation(() => 42);
// expect(dependency).toHaveBeenCalledTimes(1);

//Group of tests
describe('Register User Tests', () => {
  var email = "TestEmail1@web.de";
  var password = "Test1aaa!";
  beforeAll(async function () {
    await connectMongoDBClient();
    const collection = await getMongoUsersCollection();
    collection.remove({});
  });
  afterAll(async function* () {
    const collection = await getMongoUsersCollection();
    collection.remove({});
    await disconnectMongoDBClient();
  }); // //single test. it = synonym for "test" (function)

  it('should return Validation Failed', async function () {
    var payload = {
      "email": email,
      "password": "Test",
      //should not validate
      "firstName": "Test",
      "lastName": "Test",
      "birthdate": "01.01.2011",
      "city": "Test",
      "postcode": "Test",
      "addressLine1": "Test"
    };
    var res = await request(api).post('/users/registerUser').send(payload); //expect(res.body.details[0].context.key).toEqual("password"); //Get error details of validation error

    expect(res.body.details[0]).toHaveProperty("password"); //Check if first element of error array has key password
  });

  it('should result in successfull registration',async function () {
    var payload = {
      "email": email,
      "password": password,
      "firstName": "Test",
      "lastName": "Test",
      "birthdate": "01.01.2011",
      "city": "Test",
      "postcode": "11111",
      "addressLine1": "Teststreet 1"
    };
    var res = await request(api).post('/users/registerUser').send(payload); //console.log(res.body)

    expect(res.status).toEqual(StatusCodes.OK);
  });

  it('verify the registration with wrong token',async function () {
    var res = await request(api).post("/users/verifyRegistration/aaa"); //console.log(res)

    expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
  });

  it('verify the registration',async function () {
    let userCollection = await getMongoUsersCollection();
    let user = await userCollection.findOne({
      'email': email
    }); 
    console.log(user)

    let res = await request(api).post(`/users/verifyRegistration/${user.verifyRegistrationToken}`); 
     user = await userCollection.findOne({
        'email': email
      }); 
      console.log("updated user:");
      console.log(user)
    //console.log(res)

    expect(res.status).toEqual(StatusCodes.CREATED);
  });

  it('login the user',async function () {
    let res = await request(api).post("/users/loginUser").send({
      email: email,
      password: password
    }); //console.log(res)

    expect(res.status).toEqual(StatusCodes.OK);
  });

  it('login with wrong password',async function () {
    let res = await request(api).post("/users/loginUser").send({
      email: email,
      password: "anythingA!0"
    }); //console.log(res)

    expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
  });

  it('login with wrong email', async function () {
    let res = await request(api).post("/users/loginUser").send({
      email: "email@web.de",
      password: password
    }); //console.log(res)

    expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
  });
});
describe('Login User Tests', () => {
    beforeAll( async function() {
        await mongodb.connectClient();
      });
  afterAll(async function () {
    await mongodb.disconnectClient();
  }); //Wrong user name
  //wrong password
  //Correct credentials
}); //Stories:
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
    expect(true).toBe(true);
  });
});