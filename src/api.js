"use strict";
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser')

const middlewares = require('./middlewares');
const api = express();
api.use(cookieParser())
//Routes
const routes_users = require('./routes/routes_users');
const routes_orders = require('./routes/routes_orders');
const routes_stores = require('./routes/routes_stores');

//Adding Basic Middlewares
api.use(helmet());
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
    extended: false
}));
api.disable('x-powered-by')
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

api.use(middlewares.errorHandler);

module.exports = api;