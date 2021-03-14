'use strict';

import express from 'express';
const routerOrders = express.Router();

import errHandler from 'express-async-handler';
import { checkAuthentication } from '../middlewares';
import { parserJsonLimit } from '../utils/bodyParsers';

// Controller products
import {
    getSingleOrder,
    getUsersOrders,
    getStoresOrders,
    getAllOrders,
    createOrder,
    deleteOrder,
    updateOrder,
} from '../payment/internal/controller_orders';

routerOrders.get(
    '/singleOrder/:id',
    checkAuthentication,
    errHandler(getSingleOrder)
);
routerOrders.get(
    '/getUsersOrders',
    checkAuthentication,
    errHandler(getUsersOrders)
);
routerOrders.get(
    '/stores-orders/:storeId',
    checkAuthentication,
    errHandler(getStoresOrders)
);
routerOrders.get('/', errHandler(getAllOrders));
routerOrders.post('/createOrder', parserJsonLimit, errHandler(createOrder));
routerOrders.delete('/:id', errHandler(deleteOrder));
routerOrders.patch('/:id', parserJsonLimit, errHandler(updateOrder));

export { routerOrders };
