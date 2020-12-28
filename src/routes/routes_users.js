"use strict";

const express = require("express");
const router = express.Router();
const asyncExceptionHandler = require("express-async-handler");
const mws = require('../middlewares');

//Validation
const {
    validate
} = require('express-validation');
const vals = require("../validators/users_validators.js");
const opts = {
    keyByField: true //Reduces the validation error to a list with key/value pair "fieldname": "Message"
}

//User Controller
const controller_users = require("../controllers/controller_users");

//Get Users
router.get("/:email", asyncExceptionHandler(controller_users.getSingleUser));
router.get("/", asyncExceptionHandler(controller_users.getAllUsers));
//Login, Register
router.post("/loginUser", validate(vals.loginUserValidation, opts), asyncExceptionHandler(controller_users.loginUser));
router.post("/registerUser", validate(vals.registerUserValidation, opts), asyncExceptionHandler(controller_users.registerUser));
router.post("/verifyRegistration/:verificationToken", asyncExceptionHandler(controller_users.verifyRegistration));
//Update and Delete
router.delete("/:email", asyncExceptionHandler(controller_users.deleteUser));
router.patch("/:email", asyncExceptionHandler(controller_users.updateUserInfo));
//Shopping Cart
router.patch("/cart/:email", mws.checkAuthentication, validate(vals.cartProductValidation, opts), asyncExceptionHandler(controller_users.addToShoppingCart));
router.patch("/cartRemove/:email", mws.checkAuthentication, validate(vals.cartProductValidation, opts), asyncExceptionHandler(controller_users.removeFromShoppingCart));
router.patch("/updateCart/:email", mws.checkAuthentication, validate(vals.cartUpdateValidation, opts), asyncExceptionHandler(controller_users.updateShoppingCart));

//Password reset
router.post("/sendPasswordResetMail", asyncExceptionHandler(controller_users.sendPasswordResetMail));
router.get("/checkResetToken/:token", asyncExceptionHandler(controller_users.checkResetToken));
router.post("/resetPassword/:token", asyncExceptionHandler(controller_users.resetPassword));
router.post("/sendTestMail", asyncExceptionHandler(controller_users.sendTestMail));

module.exports = router;