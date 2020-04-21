"use strict";

const express = require("express");
const router = express.Router();
const asyncExceptionHandler = require("express-async-handler");

const controller_users = require("../controllers/controller_users");

router.get("/:email", asyncExceptionHandler(controller_users.getSingleUser));
router.get("/", asyncExceptionHandler(controller_users.getAllUsers));
router.post("/loginUser", asyncExceptionHandler(controller_users.loginUser));
router.post("/registerUser", asyncExceptionHandler(controller_users.registerUser));
router.delete("/:email", asyncExceptionHandler(controller_users.deleteUser));
router.patch("/:email", asyncExceptionHandler(controller_users.updateUser));


module.exports = router;