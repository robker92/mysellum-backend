'use strict';

// Packages
import express from 'express';
const routerProducts = express.Router();
import excHandler from 'express-async-handler';
import { validate } from 'express-validation';

import {
    createProductController,
    editProductController,
    deleteProductController,
    updateStockAmountController,
    getStoreProducts,
    getProductImageController,
} from '../controllers/products.controller';

// Utils
import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

// Validation
import {
    productVal,
    stockAmountVal,
} from '../utils/req-body-validators/products-validators';
const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

const routerPrefix = 'stores';

//Products
routerProducts.post(
    `/${routerPrefix}/:storeId/products`,
    parserJsonLimit,
    checkAuthentication,
    validate(productVal, opts),
    excHandler(createProductController)
);

routerProducts.patch(
    `/${routerPrefix}/:storeId/products/:productId`,
    parserJsonLimit,
    checkAuthentication,
    validate(productVal, opts),
    excHandler(editProductController)
);

routerProducts.delete(
    `/${routerPrefix}/:storeId/products/:productId`,
    checkAuthentication,
    excHandler(deleteProductController)
);

routerProducts.patch(
    `/${routerPrefix}/:storeId/products/:productId/stock-amount`,
    parserJsonLimit,
    checkAuthentication,
    validate(stockAmountVal, opts),
    excHandler(updateStockAmountController)
);

routerProducts.get(
    `/${routerPrefix}/:storeId/products`,
    excHandler(getStoreProducts)
);

routerProducts.get(
    `/${routerPrefix}/:storeId/products/:productId/images`,
    excHandler(getProductImageController)
);

export { routerProducts };
