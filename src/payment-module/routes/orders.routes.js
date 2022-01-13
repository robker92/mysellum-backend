'use strict';

import express from 'express';
const routerOrders = express.Router();

import errHandler from 'express-async-handler';
import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

// Controller orders
import {
    getSingleOrderController,
    getUsersOrdersController,
    getStoresOrdersController,
    getAllOrdersController,
    // createOrder,
    // deleteOrder,
    // updateOrder,
    setStepStatusController,
    searchOrderByTermController,
} from '../controllers/orders.controller';

const routerPrefix = 'orders';

routerOrders.get(
    `/${routerPrefix}/singleOrder/:id`,
    checkAuthentication,
    errHandler(getSingleOrderController)
);

routerOrders.get(
    `/${routerPrefix}/users-orders`,
    checkAuthentication,
    errHandler(getUsersOrdersController)
);

routerOrders.get(
    `/${routerPrefix}/stores-orders`,
    checkAuthentication,
    errHandler(getStoresOrdersController)
);

routerOrders.get(`/${routerPrefix}/`, errHandler(getAllOrdersController));

// routerOrders.post(
//     `/${routerPrefix}/createOrder`,
//     parserJsonLimit,
//     errHandler(createOrder)
// );

// routerOrders.delete(`/${routerPrefix}/:id`, errHandler(deleteOrder));

// routerOrders.patch(
//     `/${routerPrefix}/:id`,
//     parserJsonLimit,
//     errHandler(updateOrder)
// );

routerOrders.post(
    `/${routerPrefix}/step-status`,
    checkAuthentication,
    parserJsonLimit,
    errHandler(setStepStatusController)
);

routerOrders.get(
    `/${routerPrefix}/search-store-order/:storeId`,
    checkAuthentication,
    parserJsonLimit,
    errHandler(searchOrderByTermController)
);

export { routerOrders };
