function getMailContent(confirmationToken) {
    let htmlBody =
        `<b>Hello User</b><br/> <br/> 

    Please follow this link to confirm your e-mail address: <a href="http://127.0.0.1:8080/en/registration-confirmation/${confirmationToken}">Confirm your E-Mail</a>`;
    return htmlBody;
};

let subject = "E-Mail Confirmation";

module.exports = {
    getMailContent,
    subject
};