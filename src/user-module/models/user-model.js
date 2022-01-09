export function getUserModel(options) {
    const model = {
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email,
        phoneNumber: options.phoneNumber,
        password: options.passwordHash,
        passwordSalt: options.passwordSalt,
        // "address": {
        addressLine1: options.addressLine1,
        city: options.city,
        postcode: options.postcode,
        country: options.country ? 'DE' : '',
        companyName: options.companyName,
        //},
        birthdate: options.birthdate,
        shoppingCart: [],
        favoriteStores: [],
        datetimeCreated: options.datetimeCreated,
        datetimeAdjusted: options.datetimeAdjusted,
        ownedStoreId: '',
        emailVerified: false,
        verifyRegistrationToken: options.verificationToken,
        verifyRegistrationExpires: options.verificationExpires,
        resetPasswordExpires: null,
        resetPasswordToken: null,
        deleted: false,
        blocked: false,
    };
    return model;
}
