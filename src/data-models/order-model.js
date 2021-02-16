export function getProductModel(options) {
    const model = {
        storeId: options.storeId,
        user: {
            email: options.userEmail,
        },
        datetimeCreated: options.datetimeCreated,
        datetimeAdjusted: options.datetimeAdjusted,
        shippingType: options.shippingType,
        status: {
            finished: false,
            successfully: false, 
            steps: {
                orderReceived: "",
                paymentReceived: "",
                inDelivery: ""
            }
        },
        products: "",
        totalSum: "",
        currency: "",
        currencySymbols: "",
        billingAddress: "",
        shippingAddress: "",
        

    }
    return model;
};