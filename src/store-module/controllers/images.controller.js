'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    getImageBufferService,
    getImageBufferResizedService,
    getImageResizedService,
} from '../services/images.service';

export {
    getImageBufferController,
    getImageBufferResizedController,
    getImageResizedController,
};

const getImageBufferController = async function (req, res, next) {
    const file = req.file;

    let result;
    try {
        result = getImageBufferService(file);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        buffer: result.buffer,
        imageDetails: result.imageDetails,
    });
};

const getImageBufferResizedController = async function (req, res, next) {
    const file = req.file;

    let result;
    try {
        result = await getImageBufferResizedService(file);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        buffer: result.buffer,
        imageDetails: result.imageDetails,
    });
};

const getImageResizedController = async function (req, res, next) {
    const file = req.file;

    try {
        await getImageResizedService(file);
    } catch (error) {
        console.log(error);
        return next(error);
    }

    res.sendFile(
        'C:\\Users\\i514032\\OneDrive - SAP SE\\p\\prjct\\backend\\output.jpg'
    );
};
