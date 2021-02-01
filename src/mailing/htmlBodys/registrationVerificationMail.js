function getContentRegVerification(verificationToken) {
    let htmlBody =
        `<b>Hello User</b><br/> <br/> 

    Please follow this link to verify your e-mail address: <a href="http://127.0.0.1:8080/en/registration-verification/${verificationToken}">Verify your E-Mail</a>`;
    return htmlBody;
};

const subjectRegVerification = "E-Mail Verification";

//===================================================================================================
export { getContentRegVerification, subjectRegVerification };
//===================================================================================================