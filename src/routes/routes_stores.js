"use strict";

const express = require("express");
const router = express.Router();
const excHandler = require("express-async-handler");

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage
});

const mws = require('../middlewares');

const controller_stores = require("../controllers/controller_stores");

//Validation
const {
    validate
} = require('express-validation');
const vals = require("../validators/stores_validators.js");
const opts = {
    keyByField: true //Reduces the validation error to a list with key/value pair "fieldname": "Message"
}

//Get Stores
router.get("/:id", excHandler(controller_stores.getSingleStore));
router.get("/", excHandler(controller_stores.getAllStores));
router.get("/getStoresByLocation/:min_lat/:max_lat/:min_lng/:max_lng", excHandler(controller_stores.getStoresByLocation));
router.get("/filteredStores/:searchterm", excHandler(controller_stores.getFilteredStores));
router.post("/getFilteredStores2", excHandler(controller_stores.getFilteredStores2));
router.get("/get-product-image/:storeId/:productId", excHandler(controller_stores.getProductImage));

//Stores
router.post("/createStore", mws.checkAuthentication, validate(vals.createStoreVal, opts), upload.array('images', 12), excHandler(controller_stores.createStore));
router.patch("/editStore/:storeId", mws.checkAuthentication, validate(vals.editStoreVal, opts), excHandler(controller_stores.editStore));
router.delete("/deleteStore/:storeId", mws.checkAuthentication, excHandler(controller_stores.deleteStore));
// router.post("/addStoreImage/:storeId", mws.checkAuthentication, validate(vals.addStoreImageVal, opts), excHandler(controller_stores.addStoreImage));
// router.delete("/deleteStoreImage/:storeId/:imageId", mws.checkAuthentication, excHandler(controller_stores.deleteStoreImage));
router.post("/getImageBuffer", mws.checkAuthentication, upload.single('image'), excHandler(controller_stores.getImageBuffer));

//Reviews
router.post("/addReview/:storeId", mws.checkAuthentication, validate(vals.addReviewVal, opts), excHandler(controller_stores.addReview));
router.patch("/editReview/:storeId/:reviewId", mws.checkAuthentication, validate(vals.editReviewVal, opts), excHandler(controller_stores.editReview));
router.delete("/deleteReview/:storeId/:reviewId", mws.checkAuthentication, excHandler(controller_stores.deleteReview));

//Products
router.post("/createProduct/:storeId", mws.checkAuthentication, validate(vals.productVal, opts), excHandler(controller_stores.createProduct));
router.patch("/editProduct/:storeId/:productId", mws.checkAuthentication, validate(vals.productVal, opts), excHandler(controller_stores.editProduct));
router.delete("/deleteProduct/:storeId/:productId", mws.checkAuthentication, excHandler(controller_stores.deleteProduct));
router.patch("/updateStockAmount/:storeId/:productId", mws.checkAuthentication, validate(vals.stockAmountVal, opts), excHandler(controller_stores.updateStockAmount));
// router.post("/loginUser", excHandler(controller_users.loginUser));
// router.post("/registerUser", excHandler(controller_users.registerUser));
// router.delete("/:email", excHandler(controller_users.deleteUser));
// router.patch("/:email", excHandler(controller_users.updateUserInfo));
// router.patch("/cart/:email", mws.checkAuthentication, excHandler(controller_users.addToShoppingCart));
// router.delete("/cart/:email", mws.checkAuthentication, excHandler(controller_users.removeFromShoppingCart));

router.post("/geoCodeTest", excHandler(controller_stores.geoCodeTest));
router.post("/uploadImagesTest", upload.array('images', 12), excHandler(controller_stores.uploadImagesTest));

module.exports = router;