export function getStoreModel(options) {
    const model = {
        "userEmail": options.userEmail,
        "adminActivation": true,
        "datetimeCreated": options.datetimeCreated,
        "datetimeAdjusted": options.datetimeAdjusted,
        "mapData": {
            "address": {
                "addressLine1": options.addressLine1,
                "postcode": options.postcode,
                "city": options.city,
                "country": options.country
            },
            "img": options.mapImg,
            "location": {
                "lat": options.latitude,
                "lng": options.longitude
            },
            "mapIcon": options.mapIcon
        },
        "profileData": {
            "title": options.title,
            "subtitle": options.subtitle,
            "description": options.description,
            "tags": options.tags,
            "images": options.images,
            "products": options.products,
            "reviews": options.reviews,
            "avgRating": options.avgRating
        },
        "activationSteps": {
            "profileComplete": false,
            "minOneProduct": false,
            "shippingRegistered": false,
            "paymentMethodRegistered": false
        },
        "activation": false,
        "notifications:": {
            "receivedOrder": false,
            "productOutOfStock": {
                "atAmount": 0,
                "registered": false
            }
        },
        "shipping": {},
        "payment": {}
    };
    return model;
};

export function getStoreConfig() {
    const config = {
        title: {
            minLength: 30,
            maxLenght: 200
        }
    };
    return config;
};