'use strict';

import { ValidationError } from 'express-validation';

export { errorHandler };

const errorHandler = (err, req, res, next) => {
    console.log(err);
    //console.log(req.body)
    if (err instanceof ValidationError) {
        return res.status(400).json({
            message: JSON.stringify(err.details),
        });
    }

    //Unauthorized
    if (err.status === 401) {
        return res.status(401).json({
            success: err.success,
            type: err.type,
            message: err.message,
        });
    }

    if (err.status == 403) {
        return res.status(403).json({
            message: err.message,
        });
    } else {
        return res.status(err.status || 500).json({
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
