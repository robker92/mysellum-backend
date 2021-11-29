'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    getImageBufferService,
    getImageBufferResizedService,
    getImageResizedService,
    uploadBlobService,
    getFromBlobService,
    deleteBlobService,
} from '../services/images.service';

export {
    getImageBufferController,
    getImageBufferResizedController,
    getImageResizedController,
    uploadBlobController,
    getFromBlobController,
    deleteBlobController,
};

const getImageBufferController = async function (req, res, next) {
    const file = req.file;
    console.log(`hi`);
    console.log(req.body.test);
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

// Azure Blob Storage
const uploadBlobController = async function (req, res, next) {
    const file = req.file;
    let blobUrl;
    try {
        blobUrl = await uploadBlobService(file);
    } catch (error) {
        console.log(error);
        return next(error);
    }
    return res.status(200).send(blobUrl);
};

const getFromBlobController = async function (req, res, next) {
    const blobName = req.params.blobName;

    let blobList;
    try {
        blobList = await getFromBlobService(blobName);
    } catch (error) {
        console.log(error);
        return next(error);
    }
    return res.status(200).json({ list: blobList });
};

const deleteBlobController = async function (req, res, next) {
    const blobName = req.params.blobName;

    try {
        await deleteBlobService(blobName);
    } catch (error) {
        console.log(error);
        return next(error);
    }
    return res.sendStatus(200);
};
