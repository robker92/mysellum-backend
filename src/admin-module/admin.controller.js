'use strict';
import { StatusCodes } from 'http-status-codes';

export { healthController };

const healthController = async function (req, res, next) {
    return res.sendStatus(StatusCodes.OK);
};
