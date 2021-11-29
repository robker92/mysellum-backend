'use strict';

// Packages
import express from 'express';
const routerImages = express.Router();
import excHandler from 'express-async-handler';

import { MULTER_LIMIT } from '../../config';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({
    limits: {
        fileSize: MULTER_LIMIT,
    },
    storage: storage,
});

// Utils
import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

// Controller Images
import {
    getImageBufferController,
    getImageBufferResizedController,
    getImageResizedController,
    uploadBlobController,
    getFromBlobController,
    deleteBlobController,
} from '../controllers/images.controller';

const routerPrefix = 'stores';

routerImages.post(
    `/${routerPrefix}/image-buffer`,
    // checkAuthentication,
    upload.single('image'),
    excHandler(getImageBufferController)
);

routerImages.post(
    `/${routerPrefix}/image-buffer-resized`,
    checkAuthentication,
    upload.single('image'),
    excHandler(getImageBufferResizedController)
);

routerImages.post(
    `/${routerPrefix}/image-resized`,
    checkAuthentication,
    upload.single('image'),
    excHandler(getImageResizedController)
);

// Azure Blob Storage
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('image');

routerImages.post(
    `/${routerPrefix}/blob`,
    // checkAuthentication,
    uploadStrategy,
    excHandler(uploadBlobController)
);

routerImages.get(
    `/${routerPrefix}/blob/:blobName`,
    checkAuthentication,
    excHandler(getFromBlobController)
);

routerImages.delete(
    `/${routerPrefix}/blob/:blobName`,
    checkAuthentication,
    excHandler(deleteBlobController)
);

export { routerImages };
