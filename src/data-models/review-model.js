function get(options) {
    const model = {
        "reviewId": options.reviewId,
        "userEmail": options.userEmail,
        "userFirstName": options.firstName,
        "userLastName": options.lastName,
        "userName": options.lastName + ", " + options.firstName,
        "datetimeCreated": options.datetimeCreated,
        "datetimeAdjusted": options.datetimeAdjusted,
        "rating": options.rating,
        "text": options.text
    };
    return model;
};

module.exports = {
    get
}