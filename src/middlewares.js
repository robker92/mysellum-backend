'use strict';

import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from './config';
import { ValidationError } from 'express-validation';

const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH'
    );
    //res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Headers', 'authorization, Content-Type');
    res.header('Access-Control-Max-Age', '3600');
    // intercept OPTIONS method
    // if ('OPTIONS' == req.method) {
    //     res.status(200).send(200);
    // } else {
    //     next();
    // }
};

function grantAccess(role) {
    return async (req, res, next) => {
        try {
            console.log(role);
            const token = req.headers['x-access-token'];

            jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.status(401).send({
                        error: 'TokenInvalid',
                        message: 'Failed to authenticate token.',
                    });
                }

                console.log(`Date now: ${Date.now()}`);
                console.log(decoded);
                // if everything is good, save to request for use in other routes
                req.userId = decoded.id;
                req.userEmail = decoded.email;
                next();
            });

            // const permission = roles.can(req.user.role)[action](resource);
            // Do something
            //next();
        } catch (error) {
            next(error);
        }
    };
}

const checkAuthentication = (req, res, next) => {
    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    console.log(token);
    if (!token) {
        console.error('token invalid');
        return res.status(401).send({
            error: 'TokenInvalid',
            message: 'No token provided in the request',
        });
    }
    // verifies secret and checks exp
    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                error: 'TokenInvalid',
                message: 'Failed to authenticate token.',
            });
        }
        // if ((decoded.exp * 1000) < Date.now()) {
        //     console.log(decoded.exp)
        //     console.log(Date.now())
        //     console.log("JWT expired");
        //     return res.status(401).send({
        //         error: 'Expired',
        //         message: 'Failed to authenticate token.'
        //     });
        // };
        console.log(`Date now: ${Date.now()}`);
        console.log(decoded);
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
    console.log(err);
    //console.log(req.body)
    console.log('error handler');

    if (err instanceof ValidationError) {
        return res.status(400).send({
            message: err.message,
            details: err.details,
        });
    }

    //Unauthorized
    if (err.status === 401) {
        return res.status(401).send({
            success: err.success,
            type: err.type,
            message: err.message,
        });
    }

    if (err.status == 403) {
        return res.status(403).send({
            message: err.message,
        });
    } else {
        return res.status(err.status || 500).send({
            message: err.message,
        });
    }
    //res.render("error", { error: err });
    //console.log(err.status)
    //console.log(err.message)

    // res.json({
    //     message: err.message,
    //     error: err
    // });
};

//=============================================================================
export { allowCrossDomain, checkAuthentication, errorHandler, grantAccess };
//=============================================================================
