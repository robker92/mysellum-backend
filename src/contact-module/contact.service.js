'use strict';

import { sendNodemailerMail } from '../mailing/nodemailer';
import { MAIL_INTERNAL_CUSTOMER_SUPPORT } from '../config';

export { customerContactService };

/**
 * The function sends an email to the customer support which was triggered by a customer on the website.
 * @param {string} email string
 * @param {string} subject string
 * @param {string} phoneNr string
 * @param {string} topic string
 * @param {string} message string
 */
async function customerContactService(email, subject, phoneNr, topic, message) {
    const mailOptions = {
        email: MAIL_INTERNAL_CUSTOMER_SUPPORT,
        contentType: 'customerContact',
        userEmail: email,
        subject: subject,
        message: message,
    };

    try {
        await sendNodemailerMail(mailOptions);
    } catch (error) {
        console.log(error);
        throw error;
    }

    return;
}
