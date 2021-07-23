'use strict';

import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config';

export { checkAuthentication };

const checkAuthentication = (req, res, next) => {
    // TODO change to get cookie
    // console.log(req.cookies);
    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];

    // Cookie approach:
    // const token = req.cookies.authToken;
    // const loggedIn = req.cookies.authControl === 'true';
    console.log(token);
    if (!token) {
        console.error('token invalid');
        return res.status(401).send({
            error: 'TokenInvalid',
            message: 'No token provided in the request.',
        });
    }
    // if (!loggedIn) {
    //     console.log(`User not logged in.`);
    //     return res.status(401).send({
    //         error: 'UserNotLoggedIn',
    //         message: 'User not logged in.',
    //     });
    // }
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
