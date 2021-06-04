'use strict';
import express from 'express';
const routerAdmin = express.Router();

import excHandler from 'express-async-handler';

import { healthController } from './admin.controller';

const routerPrefix = 'admin';

// Health
routerAdmin.get(`/${routerPrefix}/health`, excHandler(healthController));

export { routerAdmin };
