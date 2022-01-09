'use strict';
import express from 'express';
const routerUsers = express.Router();

import excHandler from 'express-async-handler';
import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

import {
    getUserDataController,
    updateUserDataController,
    addStoreToFavoritesController,
    removeStoreFromFavoritesController,
} from '../controllers/users.controller';

const routerPrefix = 'users';

routerUsers.get(
    `/${routerPrefix}`,
    checkAuthentication,
    excHandler(getUserDataController)
);

routerUsers.post(
    `/${routerPrefix}`,
    parserJsonLimit,
    checkAuthentication,
    excHandler(updateUserDataController)
);

routerUsers.post(
    `/${routerPrefix}/favorite-store`,
    parserJsonLimit,
    checkAuthentication,
    excHandler(addStoreToFavoritesController)
);

routerUsers.delete(
    `/${routerPrefix}/favorite-store/:storeId`,
    checkAuthentication,
    excHandler(removeStoreFromFavoritesController)
);

export { routerUsers };
