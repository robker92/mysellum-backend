function get(options) {
    const model = {
        "productId": options.productId,
        "storeId": options.storeId,
        "datetimeCreated": options.datetimeCreated,
        "datetimeAdjusted": options.datetimeAdjusted,
        "title": options.title,
        "description": options.description,
        "imgSrc": options.imgSrc,
        "price": options.price,
        "currency": options.currency,
        "currencySymbol": options.currencySymbol,
        "quantityType": options.quantityType,
        "quantityValue": options.quantityValue,
        "stockAmount": 1
    };
    return model;
};

module.exports = {
    get
}