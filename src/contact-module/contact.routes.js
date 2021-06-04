'use strict';

// Packages
import express from 'express';
const routerContact = express.Router();
import excHandler from 'express-async-handler';
import { validate } from 'express-validation';

// Controllers
import { customerContactController } from './contact.controller';

// Utils
import { parserJsonLimit } from '../utils/bodyParsers';

// Validation
import { customerContactVal } from './utils/contact-validators';
const opts = {
    keyByField: true, //Reduces the validation error to a list with key/value pair "fieldname": "Message"
};

export { routerContact };

const routerPrefix = 'contacts';

// Routes
routerContact.post(
    `/${routerPrefix}`,
    parserJsonLimit,
    validate(customerContactVal, opts),
    excHandler(customerContactController)
);
