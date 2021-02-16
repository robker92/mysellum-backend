"use strict";

import express from "express";
const routerUsers = express.Router();

import excHandler from "express-async-handler";
import {
    checkAuthentication
} from '../middlewares';
import {
    parserJsonLimit
} from '../utils/bodyParsers';

//Validation
import {
    registerUserValidation,
    loginUserValidation,
    cartProductValidation,
    cartUpdateValidation
} from "../validators/users_validators"
import {
    validate
} from 'express-validation';

const opts = {
    keyByField: true //Reduces the validation error to a list with key/value pair "fieldname": "Message"
}

//User Controller
import {
    getSingleUser,
    getAllUsers,
    loginUser,
    registerUser,
    verifyRegistration,
    updateUserInfo,
    addToShoppingCart,
    deleteUser,
    removeFromShoppingCart,
    updateShoppingCart,
    sendPasswordResetMail,
    checkResetToken,
    resetPassword,
    sendTestMail
} from "../controllers/controller_users"

//Get Users
routerUsers.get("/:email", excHandler(getSingleUser));
routerUsers.get("/", excHandler(getAllUsers));

//Login, Register
routerUsers.post("/loginUser", parserJsonLimit, validate(loginUserValidation, opts), excHandler(loginUser));
routerUsers.post("/registerUser", parserJsonLimit, validate(registerUserValidation, opts), excHandler(registerUser));
routerUsers.post("/verifyRegistration/:verificationToken", parserJsonLimit, excHandler(verifyRegistration));

//Update and Delete
routerUsers.delete("/:email", excHandler(deleteUser));
routerUsers.patch("/:email", parserJsonLimit, excHandler(updateUserInfo));

//Shopping Cart
routerUsers.patch("/cart/:email", parserJsonLimit, checkAuthentication, validate(cartProductValidation, opts), excHandler(addToShoppingCart));
routerUsers.patch("/cartRemove/:email", parserJsonLimit, checkAuthentication, validate(cartProductValidation, opts), excHandler(removeFromShoppingCart));
routerUsers.patch("/updateCart/:email", parserJsonLimit, checkAuthentication, validate(cartUpdateValidation, opts), excHandler(updateShoppingCart));

//Password reset
routerUsers.post("/sendPasswordResetMail", parserJsonLimit, excHandler(sendPasswordResetMail));
routerUsers.get("/checkResetToken/:token", excHandler(checkResetToken));
routerUsers.post("/resetPassword/:token", parserJsonLimit, excHandler(resetPassword));
routerUsers.post("/sendTestMail", parserJsonLimit, excHandler(sendTestMail));

export { routerUsers };