function get(options) {
    const model = {
        "firstName": options.firstName,
        "lastName": options.lastName,
        "email": options.email,
        "password": options.passwordHash,
        // "address": {
        "addressLine1": options.addressLine1,
        "city": options.city,
        "postcode": options.postcode,
        //},
        "birthdate": options.birthdate,
        "shoppingCart": [],
        "creationDate": new Date().toISOString(),
        "updateDate": "",
        "ownedStoreId": "",
        "emailVerified": false,
        "verifyRegistrationToken": options.verificationToken,
        "verifyRegistrationExpires": Date.now() + 3600000, //Date now + 60min
        "resetPasswordExpires": null,
        "resetPasswordToken": null
    };
    return model;
};

module.exports = {
    get
}