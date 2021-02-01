"use strict";

import express from "express";
const routerNotif = express.Router();

import excHandler from "express-async-handler";
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

routerNotif.post("/rgstrPrdctAvNotif", parserJsonLimit, excHandler(rgstrPrdctAvNotif));
routerNotif.post("/checkNotifications", parserJsonLimit, excHandler(checkNotificationsEndpoint));
routerNotif.post("/sendNotifications", parserJsonLimit, excHandler(sendNotificationsEndpoint));

export { routerNotif };