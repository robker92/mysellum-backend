"use strict";
require('dotenv').config()

const express = require('express');
const api = express();

const bodyParser = require('body-parser');
api.use(bodyParser.json({
    limit: '50mb',
}));
api.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
}));
// api.use(express.json());
// api.use(express.urlencoded({
//     extended: true
// }));
const helmet = require('helmet');
api.use(helmet());
const cors = require('cors');
const cookieParser = require('cookie-parser')
api.use(cookieParser());
api.disable('x-powered-by');


const middlewares = require('./middlewares');
//Routes
const routes_users = require('./routes/routes_users');
const routes_orders = require('./routes/routes_orders');
const routes_stores = require('./routes/routes_stores');
const routes_notif = require('./routes/routes_notif');

//api.use(middlewares.allowCrossDomain);

//Location of the Client:
api.use(cors({
    origin: "http://127.0.0.1:8080",
    //origin: "http://localhost:8080",
    credentials: true,
    //allowedHeaders: 'Content-Type,Authorization,ETag',
    //exposedHeaders: ['Content-Type,Authorization,Content-Length,ETag']
}))
//Basic route
api.get('/', (req, res) => {
    res.json({
        name: 'Backend Application'
    });
});

//API routes
api.use('/users', routes_users);
api.use('/orders', routes_orders);
api.use('/stores', routes_stores);
api.use('/notif', routes_notif);

api.use(middlewares.errorHandler);

module.exports = api;