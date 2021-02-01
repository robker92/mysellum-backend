"use strict";

import express from "express";
const routerOrders = express.Router();

import excHandler from "express-async-handler";
import {
    checkAuthentication
} from '../middlewares';
import {
    parserJsonLimit
} from '../utils/bodyParsers';

// Controller products
import {
    getSingleOrder,
    getUsersOrders,
    getStoresOrders,
    getAllOrders,
    createOrder,
    deleteOrder,
    updateOrder
}
from "../controllers/controller_orders";

routerOrders.get("/singleOrder/:id", checkAuthentication, excHandler(getSingleOrder));
routerOrders.get("/getUsersOrders", checkAuthentication, excHandler(getUsersOrders));
routerOrders.get("/getStoresOrders/:storeId", checkAuthentication, excHandler(getStoresOrders));
routerOrders.get("/", excHandler(getAllOrders));
routerOrders.post("/createOrder", parserJsonLimit, excHandler(createOrder));
routerOrders.delete("/:id", excHandler(deleteOrder));
routerOrders.patch("/:id", parserJsonLimit, excHandler(updateOrder));

export { routerOrders };