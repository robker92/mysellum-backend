export function getOrderModel(data) {
    const model = {
        storeId: data.storeId,
        user: {
            email: data.userEmail,
        },
        datetimeCreated: data.datetimeCreated,
        datetimeAdjusted: data.datetimeAdjusted,
        shippingType: data.shippingType,
        status: {
            paypal: data.paypalStatus,
            finished: false,
            successfully: false,
            steps: {
                orderReceived: false,
                paymentReceived: false,
                inDelivery: false,
            },
        },
        products: [],
        totalSum: data.totalSum,
        totalTax: 0,
        totalShippingCosts: 0,
        platformFeeRate: data.platformFeeRate,
        currencyCode: data.currencyCode,
        // payment: data.payment,
        payment: {
            method: 'paypal',
            details: {
                paypalRefId: `${data.storeId}~${data.arrayIndex}`,
                paypalOrderId: data.paypalOrderId,
                paypalCaptureIds: [],
            },
            payer: {},
        },
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
    };
    return model;
}
