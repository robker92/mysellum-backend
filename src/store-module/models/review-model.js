export function getReviewModel(options) {
    const model = {
        reviewId: options.reviewId,
        storeId: options.storeId,
        userEmail: options.userEmail,
        userFirstName: options.userFirstName,
        userLastName: options.userLastName,
        userName: options.userLastName + ', ' + options.userFirstName,
        datetimeCreated: options.datetimeCreated,
        datetimeAdjusted: options.datetimeAdjusted,
        rating: options.rating,
        text: options.text,
    };
    return model;
}
