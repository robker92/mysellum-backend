"use strict";

const express = require("express");
const router = express.Router();
const asyncExceptionHandler = require("express-async-handler");
const middlewares = require('../middlewares');

const controller_users = require("../controllers/controller_users");

router.get("/:email", asyncExceptionHandler(controller_users.getSingleUser));
router.get("/", asyncExceptionHandler(controller_users.getAllUsers));
router.post("/loginUser", asyncExceptionHandler(controller_users.loginUser));
router.post("/registerUser", asyncExceptionHandler(controller_users.registerUser));
router.delete("/:email", asyncExceptionHandler(controller_users.deleteUser));
router.patch("/:email", asyncExceptionHandler(controller_users.updateUserInfo));
router.patch("/cart/:email", middlewares.checkAuthentication, asyncExceptionHandler(controller_users.addToShoppingCart));
router.patch("/cartRemove/:email", middlewares.checkAuthentication, asyncExceptionHandler(controller_users.removeFromShoppingCart));

module.exports = router;