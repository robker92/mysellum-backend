export function getStoreModel(options) {
    const model = {
        userEmail: options.userEmail,
        adminActivation: true,
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
        activationSteps: {
            profileComplete: options.activation?.profileComplete ?? false,
            minOneProduct: options.activation?.minOneProduct ?? false,
            shippingRegistered: options.activation?.shippingRegistered ?? false,
            paymentMethodRegistered:
                options.activation?.paymentMethodRegistered ?? false,
        },
        activation: false,
        notifications: {
            receivedOrder: false,
            productOutOfStock: {
                registered: false,
                atAmount: 0,
            },
        },
        shipping: {},
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
