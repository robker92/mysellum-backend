const nodemailer = require('nodemailer');

const config = require('../config');
//const testMail = require('./htmlBodys/testMail');
const {
    testMail,
    resetPasswordMail,
    registrationVerificationMail
} = require('./htmlBodys');

let transporter = nodemailer.createTransport({
    host: 'mail.gmx.net',
    port: 587,
    //port: 586,
    greetingTimeout: 3000,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    }
});
transporter.verify().then((verify) => {
    console.log(verify);
});

async function sendMail(options) {
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

    //Checks if the transporter is working - if not an error is thrown immediately
    let verify = await transporter.verify();
    console.log(verify);

    //Switch for mail html bodys
    let toAddress;
    let mailContent;
    let mailSubject;
    switch (options.contentType) {
        case "testMail":
            mailContent = testMail.htmlBody;
            mailSubject = testMail.subject;
            toAddress = options.email;
            break;
        case "resetPassword":
            mailContent = resetPasswordMail.getMailContent(options.resetPasswordToken);
            mailSubject = resetPasswordMail.subject;
            //toAddress = options.email;
            toAddress = "rkerscher@gmx.de";
            break;
        case "registrationVerification":
            mailContent = registrationVerificationMail.getMailContent(options.verificationToken);
            mailSubject = registrationVerificationMail.subject;
            //toAddress = options.email;
            toAddress = "rkerscher@gmx.de";
            break;
    };

    let mailOptions = {
        from: `"Awesome Website AMK! 👻" <${config.mailUser}>`,
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

module.exports = {
    sendMail
}