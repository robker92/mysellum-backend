"use strict";

const express = require("express");
const router = express.Router();
const excHandler = require("express-async-handler");
const mws = require('../middlewares');

const controller_orders = require("../controllers/controller_orders");

router.get("/singleOrder/:id", mws.checkAuthentication, excHandler(controller_orders.getSingleOrder));
router.get("/getUsersOrders", mws.checkAuthentication, excHandler(controller_orders.getUsersOrders));
router.get("/getStoresOrders/:storeId", mws.checkAuthentication, excHandler(controller_orders.getStoresOrders));
router.get("/", excHandler(controller_orders.getAllOrders));
router.post("/createOrder", excHandler(controller_orders.createOrder));
router.delete("/:id", excHandler(controller_orders.deleteOrder));
router.patch("/:id", excHandler(controller_orders.updateOrder));

module.exports = router;