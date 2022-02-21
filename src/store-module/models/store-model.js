export function getStoreModel(options) {
    const model = {
        userEmail: options.userEmail,
        adminActivation: false,
        userActivation: true,
        deleted: false,
        delivery: options.delivery,
        pickup: options.pickup,
        datetimeCreated: options.datetimeCreated,
        datetimeAdjusted: options.datetimeAdjusted,
        mapData: {
            address: {
                addressLine1: options.addressLine1,
                postcode: options.postcode,
                city: options.city,
                country: options.country,
            },
            location: {
                lat: options.lat,
                lng: options.lng,
            },
            mapIcon: options.mapIcon,
        },
        profileData: {
            title: options.title,
            subtitle: options.subtitle,
            description: options.description,
            tags: options.tags,
            images: options.images,
            // products: options.products,
            reviews: options.reviews,
            avgRating: options.avgRating,
        },
        contact: {
            phoneNumber: options.phoneNumber,
            emailAddress: options.emailAddress,
            website: options.website,
        },

        activation: false, // determined by activation steps result
        activationSteps: {
            // profileComplete: options.activation?.profileComplete ?? false,
            profileComplete: true, // init is true since validations are done during creation
            minOneProduct: options.activation?.minOneProduct ?? false,
            shippingRegistered: options.activation?.shippingRegistered ?? false,
            paymentMethodRegistered: options.activation?.paymentMethodRegistered ?? false,
        },

        openingHours: {
            monday: {
                opened: false,
                times: { open: '00:00', close: '00:00' },
            },
            tuesday: {
                opened: false,
                times: { open: '00:00', close: '00:00' },
            },
            wednesday: {
                opened: false,
                times: { open: '00:00', close: '00:00' },
            },
            thursday: {
                opened: false,
                times: { open: '00:00', close: '00:00' },
            },
            friday: { opened: false, times: { open: '00:00', close: '00:00' } },
            saturday: {
                opened: false,
                times: { open: '00:00', close: '00:00' },
            },
            sunday: { opened: false, times: { open: '00:00', close: '00:00' } },
        },
        hasOpened: false,
        notifications: {
            receivedOrder: false,
            productOutOfStock: {
                registered: false,
                atAmount: 0,
            },
        },
        shipping: {
            method: 'free', // Methods: free, threshold, fixed
            thresholdValue: 0,
            costs: 0,
            currency: 'EUR',
        },

        legalDocuments: [],

        payment: {
            registered: false,
            // https://developer.paypal.com/docs/platforms/seller-onboarding/before-payment/
            paypal: {
                common: {
                    actionUrl: '',
                    merchantId: '',
                    merchantIdInPayPal: '',
                    permissionsGranted: '',
                    accountStatus: '',
                    consentStatus: '',
                    productIntentId: '',
                    isEmailConfirmed: '',
                    returnMessage: '',
                    riskStatus: '',
                },
                urls: {
                    self: '',
                    actionUrl: '',
                },
            },
        },
    };
    return model;
}

export function getStoreConfig() {
    const config = {
        title: {
            minLength: 30,
            maxLenght: 200,
        },
    };
    return config;
}
