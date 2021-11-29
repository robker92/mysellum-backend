export { getStoreModel, getNewStoreData };

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
            type: Sequelize.STRING(15),
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
        openingHours_tuesday_times: {
            type: Sequelize.STRING(15),
            allowNull: false,
        },

        openingHours_wednesday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_wednesday_times: {
            type: Sequelize.STRING(15),
            allowNull: false,
        },

        openingHours_thursday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_thursday_times: {
            type: Sequelize.STRING(15),
            allowNull: false,
        },

        openingHours_friday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_friday_times: {
            type: Sequelize.STRING(15),
            allowNull: false,
        },

        openingHours_saturday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_saturday_times: {
            type: Sequelize.STRING(15),
            allowNull: false,
        },

        openingHours_sunday_opened: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        openingHours_sunday_times: {
            type: Sequelize.STRING(15),
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

function getNewStoreData(options) {
    const store = {
        userEmail: options.userEmail,
        adminActivation: true,
        deleted: false,
        delivery: options.delivery,
        pickup: options.pickup,

        map_address_addressLine1: options.addressLine1,
        map_address_postcode: options.postcode,
        map_address_city: options.city,
        map_address_country: options.country,
        map_location_lat: options.lat,
        map_location_lng: options.lng,
        map_mapIcon: options.mapIcon,

        profile_title: options.title,
        profile_subtitle: options.subtitle,
        profile_description: options.description,
        profile_tags: options.tags,
        profile_images: options.images,

        profile_reviews: options.reviews,
        profile_avgRating: options.avgRating,

        activation: false,
        activationSteps_profileComplete: true, // init is true since validations are done during creation
        activationSteps_minOneProduct:
            options.activation?.minOneProduct ?? false,
        activationSteps_shippingRegistered:
            options.activation?.shippingRegistered ?? false,
        activationSteps_paymentMethodRegistered:
            options.activation?.paymentMethodRegistered ?? false,

        hasOpened: false,
        openingHours_monday_opened: false,
        openingHours_monday_times: '00:00',

        openingHours_tuesday_opened: false,
        openingHours_tuesday_times: '00:00',

        openingHours_wednesdayopened: false,
        openingHours_wednesday_times: '00:00',

        openingHours_thursday_opened: false,
        openingHours_thursday_times: '00:00',

        openingHours_friday_opened: false,
        openingHours_friday_times: '00:00',

        openingHours_saturday_opened: false,
        openingHours_saturday_times: '00:00',

        openingHours_sunday_opened: false,
        openingHours_sunday_times: '00:00',

        notifications_receivedOrder: false,
        notifications_productOutOfStock_registered: false,
        notifications_productOutOfStock_atAmount: 0,

        shipping_method: 'free', // Methods: free, threshold, fixed
        shipping_thresholdValue: 0,
        shipping_costs: 0,
        shipping_currency: 'EUR',

        payment_registered: false,
        // https://developer.paypal.com/docs/platforms/seller-onboarding/before-payment/
        payment_paypal_common_actionUrl: '',
        payment_paypal_common_merchantId: '',
        payment_paypal_common_merchantIdInPayPal: '',
        payment_paypal_common_permissionsGranted: '',
        payment_paypal_common_accountStatus: '',
        payment_paypal_common_consentStatus: '',
        payment_paypal_common_productIntentId: '',
        payment_paypal_common_isEmailConfirmed: '',
        payment_paypal_common_returnMessage: '',
        payment_paypal_common_riskStatus: '',

        payment_paypal_urls_self: '',
        payment_paypal_urls_actionUrl: '',
    };
    return store;
}
