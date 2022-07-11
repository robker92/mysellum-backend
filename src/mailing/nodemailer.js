import { nodemailerTransporter } from './mailTransporter';
import { APP_ENV, checkEnvironment, MAIL_USER } from '../config';

import {
    // Product Availability Notification
    getContentPrdctAvNotif,
    subjectPrdctAvNotif,
    // Registration Verification
    getContentRegVerification,
    subjectRegVerification,
    attachmentsRegVerification,
    // Password reset
    getContentPasswordReset,
    subjectPasswordReset,
    attachmentsPasswordReset,
    // Test
    getContentTest,
    subjectTest,
    // Order Status in Delivery
    getContentOrderStatusInDelivery,
    subjectOrderStatusInDelivery,
    attachmentsOrderStatusInDelivery,
    // Order Created - Store
    getContentOrderCreatedStore,
    subjectOrderCreatedStore,
    attachmentsOrderCreatedStore,
    // Order Created - Customer
    getContentOrderCreatedCustomer,
    subjectOrderCreatedCustomer,
    attachmentsOrderCreatedCustomer,
    // Customer Contact
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

nodemailerTransporter.verify().then((verify) => {
    console.log(verify);
});
// nodemailerTransporter.verify().then((res) => console.log(res));
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
    // Checks if the transporter is working - if not an error is thrown immediately
    // const verify = await transporter.verify();
    // console.log(verify);

    try {
        validateContentType(options.contentType);
    } catch (error) {
        console.log(error);
        throw error;
    }

    // console.log(`dirname in mailer function: ${__dirname}`);

    //Switch for mail html bodys
    let toAddress;
    let mailContent;
    let mailSubject;
    let attachments;
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
            attachments = attachmentsPasswordReset;
            break;
        // case 'registrationVerification':
        case contentType.REGISTRATION_VERIFICATION:
            mailContent = getContentRegVerification(options.verificationToken);
            mailSubject = subjectRegVerification;
            attachments = attachmentsRegVerification;
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
            attachments = attachmentsOrderCreatedCustomer;
            toAddress = options.email;
            break;
        // case 'orderCreatedStore':
        case contentType.ORDER_CREATED_STORE:
            mailContent = getContentOrderCreatedStore(options);
            mailSubject = subjectOrderCreatedStore;
            attachments = attachmentsOrderCreatedStore;
            toAddress = options.email;
            break;
        // case 'orderStatusInDelivery':
        case contentType.ORDER_STATUS_IN_DELIVERY:
            mailContent = getContentOrderStatusInDelivery(options);
            mailSubject = subjectOrderStatusInDelivery;
            attachments = attachmentsOrderStatusInDelivery;
            toAddress = options.email;
            break;
        case contentType.CUSTOMER_CONTACT:
            mailContent = getContentCustomerContact(options);
            mailSubject = subjectCustomerContact;
            toAddress = options.email;
            break;
    }

    // set receiver address to this one during development
    if (checkEnvironment() === APP_ENV.DEV) {
        toAddress = 'rkerscher@gmx.de';
    }

    const mailOptions = {
        // from: `"Awesome Website! 👻" <${MAIL_USER}>`,
        from: `"Mysellum" <${MAIL_USER}>`,
        to: toAddress,
        subject: mailSubject,
        //text: 'That was easy!', //Text only content
        html: mailContent, //HTML content
        attachments: attachments,
    };

    let info;
    try {
        info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        //console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.log(error);
        throw error;
    }
    return info;
}

//===================================================================================================
export { sendNodemailerMail, contentType };
//===================================================================================================
