export function getImageModel(options) {
    const model = {
        //"productId": options.productId,
        storeId: options.storeId,
        datetimeCreated: options.datetimeCreated,
        datetimeAdjusted: options.datetimeAdjusted,
        arrayPosition: options.arrayPosition,
        imgSrc: options.imgSrc,
    };
    return model;
}
