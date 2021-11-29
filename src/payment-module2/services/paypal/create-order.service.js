import * as paypalSdk from '@paypal/checkout-server-sdk';
import { PAYPAL_BN_CODE } from '../../../config';
import { paypalClient } from './client/sdk/paypal-sdk-client';
import { getCreateOrderBody } from '../../models/create-order-body';

import { createOrderDataStructure } from '../../utils/order-utils';
// import { getShippingCostsService } from '../../../store-module/services/shipping.service';
import { validateAddress } from '../../utils/validators/address-validator';
import { validateCurrencyCode } from '../../utils/validators/currency-code-validator';

export { createPaypalOrderService };

async function createPaypalOrderService(orderData, userEmail) {
    let orderId;
    try {
        await validateAddress(orderData.billingAddress);
        await validateAddress(orderData.shippingAddress);
        validateCurrencyCode(orderData.currencyCode);
        // Get the order format { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }
        const orderObject = await createOrderDataStructure(orderData.products);
        const response = await createOrderInPaypal(orderData, orderObject);
        orderId = response.id;
    } catch (error) {
        console.log(error);
        throw error;
    }

    return orderId;
}

/**
 * Creates the Paypal Order using the Paypal Checkout SDK
 * @param {Object} orderData the input data which was send from the frontend
 * @param {Object} orderObject the order object which was created from the cart
 */
async function createOrderInPaypal(orderData, orderObject) {
    console.log(orderData);

    // const shippingCosts = await getShippingCostsService(orderData.products);
    const requestBody = await getCreateOrderBody(
        orderData,
        orderObject
        // shippingCosts
    );
    console.log(JSON.stringify(requestBody));

    const request = new paypalSdk.orders.OrdersCreateRequest();
    request.headers['PayPal-Partner-Attribution-Id'] = PAYPAL_BN_CODE;
    // request.prefer('return=representation');
    request.requestBody(requestBody);

    const order = await paypalClient().execute(request);

    // Return the order id
    return order.result;
}
