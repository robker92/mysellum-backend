export { getOrderModel, getNewOrderData };

function getOrderModel(sequelize, Sequelize) {
    const Order = sequelize.define('order', {
        // storeId: {
        //     type: Sequelize.STRING(50),
        //     allowNull: false,
        // },

        userEmail: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        shippingType: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        status_paypal: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        status_finished: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        status_successfully: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },

        status_steps_orderReceived: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        status_steps_paymentReceived: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        status_steps_inDelivery: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        products: {
            type: Sequelize.ARRAY(Sequelize.JSONB),
            allowNull: true,
        },

        totalSum: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        totalTax: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },

        totalShippingCosts: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },

        currencyCode: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        payment_method: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        payment_details_paypalRefId: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        payment_details_paypalOrderId: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        payment_details_paypalCaptureIds: {
            type: Sequelize.ARRAY(Sequelize.STRING(10000)),
            allowNull: false,
        },
        payment_payer: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        billing_addressLine1: {
            type: Sequelize.STRING(150),
            allowNull: false,
        },
        billing_city: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        billing_postcode: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        billing_country: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        shipping_addressLine1: {
            type: Sequelize.STRING(150),
            allowNull: false,
        },
        shipping_city: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        shipping_postcode: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        shipping_country: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
    });
    return Order;
}

function getNewOrderData(data) {
    const order = {
        storeId: data.storeId,
        userEmail: data.userEmail,
        shippingType: data.shippingType,

        status_paypal: data.paypalStatus,
        status_finished: false,
        status_successfully: false,
        status_steps_orderReceived: false,
        status_steps_paymentReceived: false,
        status_steps_inDelivery: false,

        products: [],
        totalSum: data.totalSum,
        totalTax: 0,
        totalShippingCosts: 0,
        currencyCode: data.currencyCode,
        // payment: data.payment,
        payment_method: 'paypal',
        payment_details_paypalRefId: `${data.storeId}~${data.arrayIndex}`,
        payment_details_paypalOrderId: data.paypalOrderId,
        payment_details_paypalCaptureIds: [],
        payment_payer: {},

        billing_addressLine1: data.billingAddressLine1,
        billing_city: data.billingCity,
        billing_postcode: data.billingPostcode,
        billing_country: data.billingCountry,

        shipping_addressLine1: data.shippingAddressLine1,
        shipping_city: data.shippingCity,
        shipping_postcode: data.shippingPostcode,
        shipping_country: data.shippingCountry,
    };
    return order;
}
