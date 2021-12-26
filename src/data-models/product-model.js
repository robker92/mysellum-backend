export function getProductModel(options) {
    const model = {
        //"productId": options.productId,
        storeId: options.storeId,
        datetimeCreated: options.datetimeCreated,
        datetimeAdjusted: options.datetimeAdjusted,
        title: options.title,
        description: options.description,
        longDescription: options.longDescription,
        imgSrc: options.imgSrc,
        imageDetails: options.imageDetails,
        price: options.price,
        priceFloat: parseFloat(options.price),
        currency: options.currency,
        currencySymbol: options.currencySymbol,
        quantityType: options.quantityType,
        quantityValue: options.quantityValue,
        delivery: options.delivery,
        pickup: options.pickup,
        stockAmount: 1,
        active: options.active,
    };
    return model;
}
