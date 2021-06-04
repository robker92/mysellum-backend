'use strict';

export { allowCrossDomain };

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
