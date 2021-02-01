"use strict";
//require('dotenv').config()
// import dotenv from 'dotenv'
// dotenv.config()

import express from "express";
const api = express();

//const bP = require('./bodyParsers');
// api.use(bP.jsonLimit);
// api.use(bP.urlEncodedLimit);
// "test": "jest",
// "start": "node ./index.js",
// "devstart": "nodemon ./index.js",

import helmet from "helmet";
api.use(helmet());

import cors from "cors";
import cookieParser from "cookie-parser";
api.use(cookieParser());
api.disable('x-powered-by');

import {
    errorHandler
} from './middlewares';
//Routes
import {
    routerNotif,
    routerOrders,
    routerStores,
    routerUsers
} from './routes';
// const routes_users = require('./routes/routes_users');
// const routes_orders = require('./routes/routes_orders');
// const routes_stores = require('./routes/routes_stores');
// const routes_notif = require('./routes/routes_notif');

//api.use(middlewares.allowCrossDomain);

//Location of the Client:
api.use(cors({
    origin: "http://127.0.0.1:8080",
    //origin: "http://localhost:8080",
    credentials: true,
    //allowedHeaders: 'Content-Type,Authorization,ETag',
    //exposedHeaders: ['Content-Type,Authorization,Content-Length,ETag']
}));
//Basic route
api.get('/', (req, res) => {
    res.json({
        name: 'Backend Application'
    });
});

//API routes
api.use('/users', routerUsers);
api.use('/orders', routerOrders);
api.use('/stores', routerStores);
api.use('/notif', routerNotif);

api.use(errorHandler);

export default api;