// module.exports = (sequelize, Sequelize) => {
export { getUserModel, getNewUserData };
function getUserModel(sequelize, Sequelize) {
    const User = sequelize.define('user', {
        firstName: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        lastName: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        email: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true,
        },

        phoneNumber: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },

        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        addressLine1: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },

        city: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        postcode: {
            type: Sequelize.STRING(7),
            allowNull: false,
        },

        companyName: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        birthdate: {
            type: Sequelize.STRING(15),
            allowNull: false,
        },

        ownedStoreId: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },

        emailVerified: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        verifyRegistrationToken: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },

        verifyRegistrationExpires: {
            type: Sequelize.STRING(20), // DATE
            allowNull: false,
        },

        resetPasswordExpires: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },

        resetPasswordToken: {
            type: Sequelize.STRING(20), // DATE
            allowNull: true,
        },

        deleted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        blocked: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        // shopping cart -> Array of json objecst
        shoppingCart: {
            // type: Sequelize.ARRAY(Sequelize.STRING(10000)),
            type: Sequelize.JSONB,
            allowNull: true,
        },

        // favorite stores -> String array
        favoriteStores: {
            type: Sequelize.ARRAY(Sequelize.STRING(10000)),
            allowNull: true,
        },
    });
    return User;
}

function getNewUserData(options) {
    const model = {
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email,
        phoneNumber: options.phoneNumber,
        password: options.passwordHash,
        addressLine1: options.addressLine1,
        city: options.city,
        postcode: options.postcode,
        companyName: options.companyName,
        birthdate: options.birthdate,
        ownedStoreId: '',
        emailVerified: false,
        verifyRegistrationToken: options.verificationToken,
        verifyRegistrationExpires: options.verificationExpires,
        resetPasswordExpires: null,
        resetPasswordToken: null,
        deleted: false,
        blocked: false,
        shoppingCart: [],
        favoriteStores: [],
    };
    return model;
}

// firstName: options.firstName,
//         lastName: options.lastName,
//         email: options.email,
//         phoneNumber: options.phoneNumber,
//         password: options.passwordHash,
//         // "address": {
//         addressLine1: options.addressLine1,
//         city: options.city,
//         postcode: options.postcode,
//         companyName: options.companyName,
//         //},
//         birthdate: options.birthdate,
//         shoppingCart: [],
//         favoriteStores: [],
//         datetimeCreated: options.datetimeCreated,
//         datetimeAdjusted: options.datetimeAdjusted,
//         ownedStoreId: '',
//         emailVerified: false,
//         verifyRegistrationToken: options.verificationToken,
//         verifyRegistrationExpires: options.verificationExpires,
//         resetPasswordExpires: null,
//         resetPasswordToken: null,
//         deleted: false,
//         blocked: false,
