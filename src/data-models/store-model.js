function get(options) {
    const model = {
        "userEmail": options.userEmail,
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
        }
    };
    return model;
};

module.exports = {
    get
}