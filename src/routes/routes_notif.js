"use strict";

const express = require("express");
const router = express.Router();
const excHandler = require("express-async-handler");
const mws = require('../middlewares');

const controller_notif = require("../controllers/notifications/controller_prdctAvNotif");

router.post("/rgstrPrdctAvNotif", excHandler(controller_notif.rgstrPrdctAvNotif));
router.post("/checkNotifications", excHandler(controller_notif.checkNotificationsEndpoint));
router.post("/sendNotifications", excHandler(controller_notif.sendNotificationsEndpoint));

module.exports = router;