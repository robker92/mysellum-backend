export function getOrderModel(data) {
    const model = {
        storeId: data.storeId,
        user: {
            email: data.userEmail,
        },
        datetimeCreated: data.datetimeCreated,
        datetimeAdjusted: data.datetimeAdjusted,
        deliveryMethod: data.deliveryMethod,
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
        products: data.products,
        platformFeeRate: data.platformFeeRate,
        currencyCode: data.currencyCode,
        valueBreakdown: {
            orderTotal: data.valueBreakdown.orderTotal,
            netItemTotal: data.valueBreakdown.netItemTotal,
            grossItemTotal: data.valueBreakdown.grossItemTotal,
            netShippingCosts: data.valueBreakdown.netShippingCosts,
            grossShippingCosts: data.valueBreakdown.grossShippingCosts,
            taxTotal: data.valueBreakdown.taxTotal,
            transferTotal: data.valueBreakdown.transferTotal,
            platformFeeTotal: data.valueBreakdown.platformFeeTotal,
            taxForTransferAmount: data.valueBreakdown.taxForTransferAmount,
        },
        payment: {
            method: 'paypal',
            details: {
                paypalRefId: `${data.storeId}~${data.arrayIndex}`,
                paypalOrderId: data.paypalOrderId,
                paypalCaptureIds: [],
            },
            payer: {},
        },
        billingAddress: {
            firstName: data.billingAddress.firstName,
            lastName: data.billingAddress.lastName,
            addressLine1: data.billingAddress.addressLine1,
            city: data.billingAddress.city,
            postcode: data.billingAddress.postcode,
            country: data.billingAddress.country,
        },
        shippingAddress: {
            firstName: data.shippingAddress.firstName,
            lastName: data.shippingAddress.lastName,
            addressLine1: data.shippingAddress.addressLine1,
            city: data.shippingAddress.city,
            postcode: data.shippingAddress.postcode,
            country: data.shippingAddress.country,
        },
    };
    return model;
}
