"use strict";

const express = require("express");
const router = express.Router();
const asyncExceptionHandler = require("express-async-handler");
const middlewares = require('../middlewares');

const controller_orders = require("../controllers/controller_orders");

router.get("/:id", middlewares.checkAuthentication, asyncExceptionHandler(controller_orders.getSingleOrder));
router.get("/", asyncExceptionHandler(controller_orders.getAllOrders));
router.post("/createOrder", asyncExceptionHandler(controller_orders.createOrder));
router.delete("/:id", asyncExceptionHandler(controller_orders.deleteOrder));
router.patch("/:id", asyncExceptionHandler(controller_orders.updateOrder));


module.exports = router;