export function getUserModel(options) {
    const model = {
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email,
        password: options.passwordHash,
        // "address": {
        addressLine1: options.addressLine1,
        city: options.city,
        postcode: options.postcode,
        companyName: options.companyName,
        //},
        birthdate: options.birthdate,
        shoppingCart: [],
        datetimeCreated: options.datetimeCreated,
        datetimeAdjusted: options.datetimeAdjusted,
        ownedStoreId: '',
        emailVerified: false,
        verifyRegistrationToken: options.verificationToken,
        verifyRegistrationExpires: Date.now() + 3600000, //Date now + 60min
        resetPasswordExpires: null,
        resetPasswordToken: null,
        deleted: false,
        blocked: false,
    };
    return model;
}
