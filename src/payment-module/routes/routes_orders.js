'use strict';

import express from 'express';
const routerOrders = express.Router();

import errHandler from 'express-async-handler';
import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

// Controller orders
import {
    getSingleOrder,
    getUsersOrders,
    getStoresOrders,
    getAllOrders,
    createOrder,
    deleteOrder,
    updateOrder,
    setStepStatus,
    searchOrderByTerm,
} from '../internal/controller_orders';

routerOrders.get(
    '/singleOrder/:id',
    checkAuthentication,
    errHandler(getSingleOrder)
);

routerOrders.get(
    '/users-orders',
    checkAuthentication,
    errHandler(getUsersOrders)
);

routerOrders.get(
    '/stores-orders',
    checkAuthentication,
    errHandler(getStoresOrders)
);

routerOrders.get('/', errHandler(getAllOrders));

routerOrders.post('/createOrder', parserJsonLimit, errHandler(createOrder));

routerOrders.delete('/:id', errHandler(deleteOrder));

routerOrders.patch('/:id', parserJsonLimit, errHandler(updateOrder));

routerOrders.post(
    '/step-status',
    checkAuthentication,
    parserJsonLimit,
    errHandler(setStepStatus)
);

routerOrders.get(
    '/search-store-order/:storeId',
    checkAuthentication,
    parserJsonLimit,
    errHandler(searchOrderByTerm)
);

export { routerOrders };
