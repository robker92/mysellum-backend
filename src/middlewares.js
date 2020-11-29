"use strict";

const jwt = require('jsonwebtoken');

const config = require('./config');
const {
    ValidationError
} = require('express-validation');

const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', "http://localhost:8080");
    res.header('Access-Control-Allow-Methods', "GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH");
    //res.header('Access-Control-Allow-Headers', '*');
    res.header("Access-Control-Allow-Headers", "authorization, Content-Type");
    res.header("Access-Control-Max-Age", "3600");
    // intercept OPTIONS method
    // if ('OPTIONS' == req.method) {
    //     res.status(200).send(200);
    // } else {
    //     next();
    // }
};

const checkAuthentication = (req, res, next) => {
    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    console.log(token)
    if (!token) {
        return res.status(401).send({
            error: 'Unauthorized',
            message: 'No token provided in the request'
        });
    }
    // verifies secret and checks exp
    jwt.verify(token, config.secretKey, (err, decoded) => {
        if (err) return res.status(401).send({
            error: 'Unauthorized',
            message: 'Failed to authenticate token.'
        });
        console.log(decoded.email)
        // if everything is good, save to request for use in other routes
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    });
};

// const errorHandler = (err, req, res, next) => {
//     if (res.headersSent) {
//         return next(err)
//     }
//     res.status(500);
//     res.render('error', {
//         error: err
//     })
// };

const errorHandler = (err, req, res, next) => {
    // if (res.headersSent) {
    //     return next(err);
    // }
    //req.logger.error(err);
    console.log(err)
    console.log(req.body)
    console.log("error handler")

    if (err.status == 403) {
        res.status(403);
        res.send({
            message: err.message
        });
    } else {
        if (err instanceof ValidationError) {
            res.status(400);
            res.send({
                message: err.message,
                details: err.details
            });
        } else {
            res.status(err.status || 500);
            res.send({
                message: err.message
            });
        }
        //res.render("error", { error: err });
        //console.log(err.status)
        //console.log(err.message)

        // res.json({
        //     message: err.message,
        //     error: err
        // });
    }
};

module.exports = {
    allowCrossDomain,
    checkAuthentication,
    errorHandler
};