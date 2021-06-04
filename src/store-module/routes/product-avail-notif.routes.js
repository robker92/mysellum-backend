'use strict';

// Packages
import express from 'express';
const routerNotif = express.Router();
import excHandler from 'express-async-handler';

// Validation
import { validate } from 'express-validation';
import { registerProductAvailabilityNotificationVal } from '../utils/req-body-validators/notif-validators.js';
const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

// Controllers
import {
    registerProductAvailNotificationController,
    checkNotificationsEndpoint,
    sendNotificationsEndpoint,
} from '../controllers/product-avail-notif.controller';

// Utils
import { checkAuthentication } from '../../middlewares/CheckAuthentication';
import { parserJsonLimit } from '../../utils/bodyParsers';

const routerPrefix = 'notif';

routerNotif.post(
    `/${routerPrefix}/register-product-availability-notification`,
    parserJsonLimit,
    validate(registerProductAvailabilityNotificationVal, opts),
    excHandler(registerProductAvailNotificationController)
);

routerNotif.post(
    `/${routerPrefix}/check-notifications`,
    parserJsonLimit,
    excHandler(checkNotificationsEndpoint)
);

routerNotif.post(
    `/${routerPrefix}/send-notifications`,
    parserJsonLimit,
    excHandler(sendNotificationsEndpoint)
);

export { routerNotif };
