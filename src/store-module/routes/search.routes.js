'use strict';

// Packages
import express from 'express';
const routerSearch = express.Router();
import excHandler from 'express-async-handler';

// Controllers
import {
    getFilteredStores,
    getFilteredStores2,
    getStoresDelivery,
    getStoresByLocation,
} from '../controllers/search.controller';

// Utils
// import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

const routerPrefix = 'search';

routerSearch.post(
    `/${routerPrefix}/getStoresByLocation/:min_lat/:max_lat/:min_lng/:max_lng`,
    parserJsonLimit,
    excHandler(getStoresByLocation)
);

routerSearch.get(
    `/${routerPrefix}/search-delivery`,
    excHandler(getStoresDelivery)
);

//routerSearch.get(`/${routerPrefix}/filteredStores/:searchterm`, excHandler(controller_stores.getFilteredStores));
//routerSearch.post(`/${routerPrefix}/getFilteredStores2`, parserJsonLimit, excHandler(controller_stores.getFilteredStores2));

export { routerSearch };
