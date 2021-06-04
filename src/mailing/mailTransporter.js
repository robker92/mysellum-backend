import nodemailer from 'nodemailer';
import { MAIL_HOST, MAIL_USER, MAIL_PW } from '../config';

const nodemailerTransporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 587,
    //port: 586,
    greetingTimeout: 3000,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PW,
    },
});

//===================================================================================================
export { nodemailerTransporter };
//===================================================================================================
