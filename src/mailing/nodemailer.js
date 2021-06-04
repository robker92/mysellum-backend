import { nodemailerTransporter } from './mailTransporter';
import { MAIL_USER } from '../config';

import {
    getContentPrdctAvNotif,
    subjectPrdctAvNotif,
    getContentRegVerification,
    subjectRegVerification,
    getContentPasswordReset,
    subjectPasswordReset,
    getContentTest,
    subjectTest,
    getContentOrderStatusInDelivery,
    subjectOrderStatusInDelivery,
    getContentOrderCreatedStore,
    subjectOrderCreatedStore,
    getContentOrderCreatedCustomer,
    subjectOrderCreatedCustomer,
    getContentCustomerContact,
    subjectCustomerContact,
} from './htmlBodys';

import { contentType } from './enums/contentType';
import { validateContentType } from './validators/validateContentType';
// let transporter = nodemailer.createTransport({
//     host: 'mail.gmx.net',
//     port: 587,
//     //port: 586,
//     greetingTimeout: 3000,
//     auth: {
//         user: config.mailUser,
//         pass: config.mailPass
//     }
// });

// nodemailerTransporter.verify().then((verify) => {
//     console.log(verify);
// });

/**
 * The function receives and options object and sends then the respective email.
 * @param {object} options contains 'contentType', 'email' and - depending on the email which should be send
 * 'resetPasswordToken' or 'verificationToken'
 * @returns
 */
async function sendNodemailerMail(options) {
    // let testAccount = await nodemailer.createTestAccount();
    // let transporterTest = nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //         user: testAccount.user,
    //         pass: testAccount.pass
    //     }
    // });
    const transporter = nodemailerTransporter;
    //Checks if the transporter is working - if not an error is thrown immediately
    let verify = await transporter.verify();
    console.log(verify);

    try {
        validateContentType(options.contentType);
    } catch (error) {
        console.log(error);
        return error;
    }

    //Switch for mail html bodys
    let toAddress;
    let mailContent;
    let mailSubject;
    switch (options.contentType) {
        case contentType.TEST_MAIL:
            mailContent = getContentTest();
            mailSubject = subjectTest;
            toAddress = options.email;
            break;
        // case 'resetPassword':
        case contentType.RESET_PASSWORD:
            mailContent = getContentPasswordReset(options.resetPasswordToken);
            mailSubject = subjectPasswordReset;
            toAddress = options.email;
            break;
        // case 'registrationVerification':
        case contentType.REGISTRATION_VERIFICATION:
            mailContent = getContentRegVerification(options.verificationToken);
            mailSubject = subjectRegVerification;
            toAddress = options.email;
            break;
        // case 'prdctAvNotif':
        case contentType.PRODUCT_AVAILABILITY_NOTIF:
            mailContent = getContentPrdctAvNotif(options);
            mailSubject = subjectPrdctAvNotif;
            toAddress = options.email;
            break;
        // case 'orderCreatedCustomer':
        case contentType.ORDER_CREATED_CUSTOMER:
            mailContent = getContentOrderCreatedCustomer(options);
            mailSubject = subjectOrderCreatedCustomer;
            toAddress = options.email;
            break;
        // case 'orderCreatedStore':
        case contentType.ORDER_CREATED_STORE:
            mailContent = getContentOrderCreatedStore(options);
            mailSubject = subjectOrderCreatedStore;
            toAddress = options.email;
            break;
        // case 'orderStatusInDelivery':
        case contentType.ORDER_STATUS_IN_DELIVERY:
            mailContent = getContentOrderStatusInDelivery(options);
            mailSubject = subjectOrderStatusInDelivery;
            toAddress = options.email;
            break;
        case contentType.CUSTOMER_CONTACT:
            mailContent = getContentCustomerContact(options);
            mailSubject = subjectCustomerContact;
            toAddress = options.email;
            break;
    }

    if (process.env.NODE_ENV === 'development') {
        toAddress = 'rkerscher@gmx.de';
    }

    let mailOptions = {
        from: `"Awesome Website! 👻" <${MAIL_USER}>`,
        to: toAddress,
        subject: mailSubject,
        //text: 'That was easy!', //Text only content
        html: mailContent, //HTML content
    };

    let info;
    try {
        info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        //console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.log(error);
        return error;
    }
}

//===================================================================================================
export { sendNodemailerMail };
//===================================================================================================
