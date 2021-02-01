function getContentPasswordReset(resetToken) {
    let htmlBody =
        `<b>Hello User</b><br/> <br/> 

    you requested a password reset. Please follow this link: <a href="http://127.0.0.1:8080/en/password-reset/${resetToken}">Reset your password</a>`;
    return htmlBody;
};

const subjectPasswordReset = "Password reset";

//===================================================================================================
export { getContentPasswordReset, subjectPasswordReset };
//===================================================================================================