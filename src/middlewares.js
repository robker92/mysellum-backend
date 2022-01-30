'use strict';

import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from './config';
import { ValidationError } from 'express-validation';

const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH');
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
    // console.log(JSON.stringify(req.body));
    // console.log(token);
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
            console.log('JWT invalid.');
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

const validateRequestBody = (schema) => {
    return (req, res, next) => {
        const testSchema = schema.body;
        const result = testSchema.validate(req.body);
        console.log(result.value.products);
        console.log(JSON.stringify(result.error?.details));

        // const testObj = {
        //     _id: '61c8633f05317d26e0a17e8f',
        //     storeId: '6137160fc72967106c582580',
        //     datetimeCreated: '2021-12-26T12:42:39.658Z',
        //     datetimeAdjusted: '2021-12-26T12:45:45.401Z',
        //     title: 'Product 1',
        //     description: 'Test Test Test Test Test ',
        //     imgSrc: 'https://prjctstorageaccount.blob.core.windows.net/prjct-dev-images/G27Z_ZuQgK4S0nQBQLaM3~product3.jpg',
        //     imageDetails: {
        //         size: 2393496,
        //         originalname: 'product3.jpg',
        //         name: 'product3.jpg',
        //     },
        //     price: '1.50',
        //     priceFloat: 1.5,
        //     currency: 'EUR',
        //     currencySymbol: '€',
        //     quantityType: 'Kilograms',
        //     quantityValue: '2',
        //     delivery: true,
        //     pickup: false,
        //     stockAmount: 1,
        //     active: true,
        //     longDescription: 'asdas vasd asd dasd',
        // };

        // const result2 = testSchema.validate(testObj);
        // console.log(result2);
        // console.log(JSON.stringify(result2.error.details));
        next();
    };
};

// when a jwt is present, it is decoded and the results are added to the request
// an error does not abort the process.
// const jwtOptional = (req, res, next) => {
//     const token = req.headers['x-access-token'];

//     if (!token) {
//         // when there is an error skip to next mw
//         return next();
//     }

//     jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
//         if (err) {
//             // when there is an error skip to next mw
//             return next();
//         }

//         console.log(`Date now: ${Date.now()}`);
//         console.log(decoded);
//         // if everything is good, save to request for use in other routes
//         req.userId = decoded.id;
//         req.userEmail = decoded.email;
//         return next();
//     });
// };

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
    console.log(err instanceof ValidationError);
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
export {
    allowCrossDomain,
    checkAuthentication,
    validateRequestBody,
    errorHandler,
    grantAccess,
    // jwtOptional,
};
//=============================================================================
