'use strict';

// Packages
import express from 'express';
const routerStores = express.Router();
import excHandler from 'express-async-handler';
import { validate } from 'express-validation';

// Multer
import multer from 'multer';
import { MULTER_LIMIT } from '../../config';
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

// Controllers
import {
    getSingleStoreController,
    createStoreController,
    editStoreController,
    deleteStoreController,
} from '../controllers/stores.controller';

// Validation
import {
    editStoreVal,
    createStoreVal,
} from '../utils/req-body-validators/stores-validators';
const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

const routerPrefix = 'stores';

routerStores.get(
    `/${routerPrefix}/:storeId`,
    excHandler(getSingleStoreController)
);
// routerStores.get(`/${routerPrefix}`, excHandler(controller_stores.getAllStores));

//router.get(`/${routerPrefix}filteredStores/:searchterm`, excHandler(controller_stores.getFilteredStores));
//router.post(`/${routerPrefix}/getFilteredStores2`, parserJsonLimit, excHandler(controller_stores.getFilteredStores2));

//Stores
routerStores.post(
    `/${routerPrefix}`,
    parserJsonLimit,
    checkAuthentication,
    validate(createStoreVal, opts),
    upload.array('images', 12),
    excHandler(createStoreController)
);

routerStores.patch(
    `/${routerPrefix}/:storeId`,
    parserJsonLimit,
    checkAuthentication,
    validate(editStoreVal, opts),
    excHandler(editStoreController)
);

routerStores.delete(
    `/${routerPrefix}/:storeId`,
    checkAuthentication,
    excHandler(deleteStoreController)
);
// router.post(`/${routerPrefix}addStoreImage/:storeId`, checkAuthentication, validate(addStoreImageVal, opts), excHandler(controller_stores.addStoreImage));
// router.delete(`/${routerPrefix}deleteStoreImage/:storeId/:imageId`, checkAuthentication, excHandler(controller_stores.deleteStoreImage));

export { routerStores };
