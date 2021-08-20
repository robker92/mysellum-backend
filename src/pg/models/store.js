// module.exports = (sequelize, Sequelize) => {
export { getStoreModel };
function getStoreModel(sequelize, Sequelize) {
    const Store = sequelize.define('store', {
        userEmail: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        adminActivation: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        deleted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        delivery: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        pickup: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        map_address_addressLine1: {
            type: Sequelize.STRING(150),
            allowNull: false,
        },
        map_address_postcode: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        map_address_city: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        map_address_country: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        map_location_lat: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        map_location_lng: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        map_mapIcon: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        profile_title: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        profile_subtitle: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        profile_description: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        profile_tags: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: false,
        },
        profile_images: {
            type: Sequelize.ARRAY(Sequelize.STRING(100000)),
            allowNull: false,
        },
        profile_reviews: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        profile_avgRating: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },

        activation: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        activationSteps_profileComplete: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        activationSteps_minOneProduct: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        activationSteps_shippingRegistered: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        activationSteps_paymentMethodRegistered: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        hasOpened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        openingHours_monday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_monday_times_open: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        openingHours_monday_times_close: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },

        openingHours_tuesday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_tuesday_times_open: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        openingHours_tuesday_times_close: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },

        openingHours_wednesday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_wednesday_times_open: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        openingHours_wednesday_times_close: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },

        openingHours_thursday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_thursday_times_open: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        openingHours_thursday_times_close: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },

        openingHours_friday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_friday_times_open: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        openingHours_friday_times_close: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },

        openingHours_saturday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_saturday_times_open: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        openingHours_saturday_times_close: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },

        openingHours_sunday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_sunday_times_open: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
        openingHours_sunday_times_close: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },

        notifications_receivedOrder: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },
        notifications_productOutOfStock_registered: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },
        notifications_productOutOfStock_atAmount: {
            type: Sequelize.FLOAT,
            allowNull: true,
        },

        shipping_method: {
            type: Sequelize.STRING(10),
            allowNull: true,
        },
        shipping_thresholdValue: {
            type: Sequelize.FLOAT,
            allowNull: true,
        },
        shipping_costs: {
            type: Sequelize.FLOAT,
            allowNull: true,
        },
        shipping_currency: {
            type: Sequelize.STRING(10),
            allowNull: true,
        },

        // https://developer.paypal.com/docs/platforms/seller-onboarding/before-payment/
        payment_registered: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        payment_paypal_common_actionUrl: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_common_merchantId: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_common_merchantIdInPayPal: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_common_permissionsGranted: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_common_accountStatus: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_common_consentStatus: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_common_productIntentId: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_common_isEmailConfirmed: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_common_returnMessage: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_common_riskStatus: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_urls_self: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        payment_paypal_urls_actionUrl: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
    });
    return Store;
}
