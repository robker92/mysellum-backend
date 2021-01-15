const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
    host: 'mail.gmx.net',
    port: 587,
    //port: 586,
    greetingTimeout: 3000,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    }
});

// transporter.verify().then((verify) => {
//     console.log(verify);
// });

function get() {
    return transporter;
};

module.exports = {
    get
};