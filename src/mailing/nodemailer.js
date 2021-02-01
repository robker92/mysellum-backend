import { nodemailerTransporter } from './mailTransporter'
import {
    MAIL_USER
} from '../config';

import { getContentPrdctAvNotif, subjectPrdctAvNotif, getContentRegVerification, subjectRegVerification, getContentPasswordReset, subjectPasswordReset, getContentTest, subjectTest } from './htmlBodys'
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

    //Switch for mail html bodys
    let toAddress;
    let mailContent;
    let mailSubject;
    switch (options.contentType) {
        case "testMail":
            mailContent = getContentTest();
            mailSubject = subjectTest;
            toAddress = options.email;
            break;
        case "resetPassword":
            mailContent = getContentPasswordReset(options.resetPasswordToken);
            mailSubject = subjectPasswordReset;
            //toAddress = options.email;
            toAddress = "rkerscher@gmx.de";
            break;
        case "registrationVerification":
            mailContent = getContentRegVerification(options.verificationToken);
            mailSubject = subjectRegVerification;
            //toAddress = options.email;
            toAddress = "rkerscher@gmx.de";
            break;
        case "prdctAvNotif":
            mailContent = getContentPrdctAvNotif(options);
            mailSubject = subjectPrdctAvNotif;
            toAddress = options.email;
            //toAddress = "rkerscher@gmx.de";
            break;
    };

    let mailOptions = {
        from: `"Awesome Website AMK! 👻" <${MAIL_USER}>`,
        to: toAddress,
        subject: mailSubject,
        //text: 'That was easy!', //Text only content
        html: mailContent //HTML content
    };

    let info;
    try {
        info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        //console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        return error;
        // return next({
        //     status: 500,
        //     message: "Error while sending!"
        // })
    };
};

//===================================================================================================
export { sendNodemailerMail };
//===================================================================================================