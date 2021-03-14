'use strict';

// Dev data factory
import {
    createFakeData,
    createFakeDataEndpoint,
} from '../dev-data-factory/dev-data-factory';

import { MULTER_LIMIT } from '../config';

import express from 'express';
const routerStores = express.Router();

import excHandler from 'express-async-handler';

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({
    limits: {
        fileSize: MULTER_LIMIT,
    },
    storage: storage,
});

import { checkAuthentication, grantAccess } from '../middlewares';

import { parserJsonLimit, parserUrlEncodedLimit } from '../utils/bodyParsers';

const controller_stores = require('../controller/controller_stores_old');

// Controller stores
import {
    getSingleStore,
    createStore,
    editStore,
    deleteStore,
} from '../controller/stores/controller-stores';

// Controller products
import {
    createProduct,
    editProduct,
    deleteProduct,
    updateStockAmount,
    getStoreProducts,
    getProductImage,
} from '../controller/stores/controller-products';

// Controller Reviews
import {
    addReview,
    editReview,
    deleteReview,
} from '../controller/stores/controller-reviews';
// Controller Search
import {
    getStoresByLocation,
    getStoresDelivery,
} from '../controller/stores/controller-search';

import { paypalEndpoint } from '../payment/paypal/paypal-rest-client';

// Controller Images
import {
    getImageBuffer,
    getImageBufferResized,
    getImageResized,
} from '../controller/stores/controller-images';

//Validation
import { validate } from 'express-validation';
// const {
//     validate
// } = require('express-validation');
import {
    addReviewVal,
    editReviewVal,
    productVal,
    stockAmountVal,
    editStoreVal,
    createStoreVal,
} from '../validators/stores_validators.js';
const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

//Pipeline: bodyParser, authetication,validate,upload,executionHandler + function
//Get Stores
routerStores.get('/single-store/:id', excHandler(getSingleStore));
routerStores.get('/', excHandler(controller_stores.getAllStores));
routerStores.get(
    '/getStoresByLocation/:min_lat/:max_lat/:min_lng/:max_lng',
    excHandler(getStoresByLocation)
);
routerStores.get('/search-delivery', excHandler(getStoresDelivery));
//router.get("/filteredStores/:searchterm", excHandler(controller_stores.getFilteredStores));
//router.post("/getFilteredStores2", parserJsonLimit, excHandler(controller_stores.getFilteredStores2));

//Stores
routerStores.post(
    '/store',
    parserJsonLimit,
    checkAuthentication,
    validate(createStoreVal, opts),
    upload.array('images', 12),
    excHandler(createStore)
);
routerStores.patch(
    '/store/:storeId',
    parserJsonLimit,
    checkAuthentication,
    validate(editStoreVal, opts),
    excHandler(editStore)
);
routerStores.delete('/:storeId', checkAuthentication, excHandler(deleteStore));
// router.post("/addStoreImage/:storeId", checkAuthentication, validate(addStoreImageVal, opts), excHandler(controller_stores.addStoreImage));
// router.delete("/deleteStoreImage/:storeId/:imageId", checkAuthentication, excHandler(controller_stores.deleteStoreImage));
routerStores.post(
    '/image-buffer',
    checkAuthentication,
    upload.single('image'),
    excHandler(getImageBuffer)
);
routerStores.post(
    '/image-buffer-resized',
    checkAuthentication,
    upload.single('image'),
    excHandler(getImageBufferResized)
);
routerStores.post(
    '/image-resized',
    checkAuthentication,
    upload.single('image'),
    excHandler(getImageResized)
);

//Reviews
routerStores.post(
    '/addReview/:storeId',
    parserJsonLimit,
    checkAuthentication,
    validate(addReviewVal, opts),
    excHandler(addReview)
);
routerStores.patch(
    '/editReview/:storeId/:reviewId',
    parserJsonLimit,
    checkAuthentication,
    validate(editReviewVal, opts),
    excHandler(editReview)
);
routerStores.delete(
    '/deleteReview/:storeId/:reviewId',
    checkAuthentication,
    excHandler(deleteReview)
);

//Products
routerStores.post(
    '/product/:storeId',
    parserJsonLimit,
    checkAuthentication,
    validate(productVal, opts),
    excHandler(createProduct)
);
routerStores.patch(
    '/product/:storeId/:productId',
    parserJsonLimit,
    checkAuthentication,
    validate(productVal, opts),
    excHandler(editProduct)
);
routerStores.delete(
    '/product/:storeId/:productId',
    checkAuthentication,
    excHandler(deleteProduct)
);
routerStores.patch(
    '/product-stock/:storeId/:productId',
    parserJsonLimit,
    checkAuthentication,
    validate(stockAmountVal, opts),
    excHandler(updateStockAmount)
);
routerStores.get('/store-products/:storeId', excHandler(getStoreProducts));
routerStores.get(
    '/product-image/:storeId/:productId',
    excHandler(getProductImage)
);
// router.post("/loginUser", excHandler(controller_users.loginUser));
// router.post("/registerUser", excHandler(controller_users.registerUser));
// router.delete("/:email", excHandler(controller_users.deleteUser));
// router.patch("/:email", excHandler(controller_users.updateUserInfo));
// router.patch("/cart/:email", checkAuthentication, excHandler(controller_users.addToShoppingCart));
// router.delete("/cart/:email", checkAuthentication, excHandler(controller_users.removeFromShoppingCart));

routerStores.post(
    '/geoCodeTest',
    grantAccess('StoreOwner'),
    excHandler(controller_stores.geoCodeTest)
);
routerStores.post(
    '/uploadImagesTest',
    parserUrlEncodedLimit,
    upload.array('images', 12),
    excHandler(controller_stores.uploadImagesTest)
);

routerStores.get('/create-fake-data', createFakeData);
routerStores.get('/delete-all-data', createFakeDataEndpoint);

//console.log(router)
export { routerStores };
