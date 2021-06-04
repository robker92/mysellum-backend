'use strict';
import { StatusCodes } from 'http-status-codes';
import { customerContactService } from './contact.service';

export { customerContactController };

const customerContactController = async function (req, res, next) {
    const email = req.body.email;
    const subject = req.body.subject;
    const phoneNr = req.body.phoneNr;
    const topic = req.body.topic;
    const message = req.body.message;

    try {
        await customerContactService(email, subject, phoneNr, topic, message);
    } catch (error) {
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
};
