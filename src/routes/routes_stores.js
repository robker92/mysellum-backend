"use strict";

const express = require("express");
const router = express.Router();
const asyncExceptionHandler = require("express-async-handler");
const mws = require('../middlewares');

const controller_stores = require("../controllers/controller_stores");

//Get Stores
router.get("/:id", asyncExceptionHandler(controller_stores.getSingleStore));
router.get("/", asyncExceptionHandler(controller_stores.getAllStores));
router.get("/getStoresByLocation/:min_lat/:max_lat/:min_lng/:max_lng", asyncExceptionHandler(controller_stores.getStoresByLocation));
router.get("/filteredStores/:searchterm", asyncExceptionHandler(controller_stores.getFilteredStores));
router.post("/getFilteredStores2", asyncExceptionHandler(controller_stores.getFilteredStores2));
//Create Update Delete Stores
router.post("/createStore", asyncExceptionHandler(controller_stores.createStore));
router.post("/editStore/:storeId", asyncExceptionHandler(controller_stores.editStore));
router.delete("/deleteStore/:storeId", asyncExceptionHandler(controller_stores.deleteStore));
router.post("/addStoreImage/:storeId", asyncExceptionHandler(controller_stores.addStoreImage));
router.post("/deleteStoreImage/:storeId/:imageId", asyncExceptionHandler(controller_stores.deleteStoreImage));

//Reviews
router.post("/addReview", asyncExceptionHandler(controller_stores.addReview));
router.post("/editReview", asyncExceptionHandler(controller_stores.editReview));
router.delete("/deleteReview/:storeId/:reviewId", asyncExceptionHandler(controller_stores.deleteReview));

//Products
router.post("/addProduct", asyncExceptionHandler(controller_stores.addProduct));
router.post("/editProduct/:storeId/:productId", asyncExceptionHandler(controller_stores.editProduct));
router.delete("/deleteProduct/:storeId/:productId", asyncExceptionHandler(controller_stores.deleteProduct));
router.patch("/updateStockAmount/:storeId/:productId", asyncExceptionHandler(controller_stores.updateStockAmount));
// router.post("/loginUser", asyncExceptionHandler(controller_users.loginUser));
// router.post("/registerUser", asyncExceptionHandler(controller_users.registerUser));
// router.delete("/:email", asyncExceptionHandler(controller_users.deleteUser));
// router.patch("/:email", asyncExceptionHandler(controller_users.updateUserInfo));
// router.patch("/cart/:email", mws.checkAuthentication, asyncExceptionHandler(controller_users.addToShoppingCart));
// router.delete("/cart/:email", mws.checkAuthentication, asyncExceptionHandler(controller_users.removeFromShoppingCart));

router.post("/geoCodeTest", asyncExceptionHandler(controller_stores.geoCodeTest));

module.exports = router;