"use strict";

import express from "express";
const routerNotif = express.Router();

import excHandler from "express-async-handler";

import {
    validate
} from 'express-validation'
// import {
//     checkAuthentication
// } from '../middlewares';
import {
    parserJsonLimit
} from '../utils/bodyParsers';

import {
    rgstrPrdctAvNotif,
    checkNotificationsEndpoint,
    sendNotificationsEndpoint
} from '../controllers/notifications/controller_prdctAvNotif';

import { registerProductAvailabilityNotificationVal } from "../validators/notif_validators.js";
const opts = {
    keyByField: true //Reduces the validation error to a list with key/value pair "fieldname": "Message"
}

routerNotif.post("/rgstrPrdctAvNotif", parserJsonLimit, validate(registerProductAvailabilityNotificationVal, opts), excHandler(rgstrPrdctAvNotif));
routerNotif.post("/checkNotifications", parserJsonLimit, excHandler(checkNotificationsEndpoint));
routerNotif.post("/sendNotifications", parserJsonLimit, excHandler(sendNotificationsEndpoint));

export { routerNotif };