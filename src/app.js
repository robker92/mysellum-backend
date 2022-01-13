'use strict';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

//Routers
import {
    routerStores,
    routerImages,
    routerNotif,
    routerProducts,
    routerReviews,
    routerSearch,
    routerShipping,
} from './store-module/routes/index';
import { routerAdmin } from './admin-module';
import {
    routerAuthentication,
    routerShoppingCart,
    routerUsers,
} from './user-module/routes';
import { routerContact } from './contact-module/contact.routes';
import { errorHandler } from './middlewares/ErrorHandler';

// import { routerPaypal } from './payment-module/paypal/paypal-routes';
// import { routerOrders } from './payment-module/routes';
import { routerPaypal, routerOrders } from './payment-module/routes';

// import { routerPgTest } from './pg/endpoint';

const app = express();
app.use(helmet());
app.use(cookieParser());
app.disable('x-powered-by');

// Cors Whitelisted Origins:
const corsWhitelist = ['https://prjct-frontend.azurewebsites.net'];
if (process.env.NODE_ENV === 'development') {
    corsWhitelist.push('http://127.0.0.1:8080');
    corsWhitelist.push('http://localhost:8080');
}
// console.log(corsWhitelist);
app.use(
    cors({
        origin: corsWhitelist,
        // origin: 'https://prjct-frontend.azurewebsites.net/*',
        credentials: true,
        // preflightContinue: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type,Authorization,ETag,x-access-token',
        optionsSuccessStatus: 204,
        //exposedHeaders: ['Content-Type,Authorization,Content-Length,ETag']
    })
);

// App Info
app.get('/', (req, res) => {
    res.json({
        name: 'Backend Application',
        author: 'Robert Kerscher liebt Nell <3',
        contact: 'RKerscher@gmx.de',
    });
});

// Admin Context
app.use('/', routerAdmin);

// Orders Context
app.use('/', routerOrders);
app.use('/', routerPaypal);

// Store Context
app.use('/', routerStores);
app.use('/', routerImages);
app.use('/', routerNotif);
app.use('/', routerProducts);
app.use('/', routerReviews);
app.use('/', routerSearch);
app.use('/', routerShipping);

// User Context
app.use('/', routerAuthentication);
app.use('/', routerShoppingCart);
app.use('/', routerContact);
app.use('/', routerUsers);

// PG Test
// app.use('/', routerPgTest);

// Global Error Handler
app.use(errorHandler);

export default app;
