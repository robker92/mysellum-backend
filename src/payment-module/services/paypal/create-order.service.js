import * as paypalSdk from '@paypal/checkout-server-sdk';
import { PAYPAL_BN_CODE } from '../../../config';
import { paypalClient } from './client/sdk/paypal-sdk-client';
import { getCreatePaypalOrderBody } from '../../models/create-paypal-order-body';

import { createOrderDataStructure } from '../../utils/order-utils';
// import { getShippingCostsService } from '../../../store-module/services/shipping.service';
import { validateOrderAddress } from '../../utils/validators/address-validator';
import { validateCurrencyCode } from '../../utils/validators/currency-code-validator';
import { ValidationError } from '../../errors/validation-error';

export { createPaypalOrderService };

async function createPaypalOrderService(orderData, userEmail) {
    let orderId;

    const addressResult1 = await validateOrderAddress(orderData.billingAddress);
    // TODO
    // We use the validated address
    orderData.billingAddress.addressLine1 = `${addressResult1.streetName} ${addressResult1.streetNumber}`;
    orderData.billingAddress.city = addressResult1.city;
    orderData.billingAddress.postcode = addressResult1.zipcode;
    orderData.billingAddress.country = addressResult1.country;

    await validateOrderAddress(orderData.shippingAddress);
    // We use the validated address
    orderData.shippingAddress.addressLine1 = `${addressResult1.streetName} ${addressResult1.streetNumber}`;
    orderData.shippingAddress.city = addressResult1.city;
    orderData.shippingAddress.postcode = addressResult1.zipcode;
    orderData.shippingAddress.country = addressResult1.country;

    validateCurrencyCode(orderData.currencyCode);

    if (orderData.deliveryMethod !== 'delivery' && orderData.deliveryMethod !== 'pickup') {
        throw new ValidationError("Invalid delivery method provided. Only 'delivery' and 'pickup' is supported.");
    }

    // Get the order format { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }
    const orderObject = await createOrderDataStructure(orderData.products, orderData.deliveryMethod);
    const storeIds = Object.keys(orderObject);

    if (storeIds.length > 10) {
        // Paypal is only able to process payments to 10 stores per order
        // https://developer.paypal.com/docs/multiparty/checkout/multiseller-payments/
        throw new ValidationError('You cannot buy products from more than 10 stores in a single order, we are sorry.');
    }

    const response = await createOrderInPaypal(orderObject, orderData.currencyCode, orderData.shippingAddress);
    orderId = response.id;

    return orderId;
}

/**
 * Creates the Paypal Order using the Paypal Checkout SDK
 * @param {Object} orderObject the order object which was created from the cart
 * @param {String} currencyCode
 * @param {Object} shippingAddress
 */
async function createOrderInPaypal(orderObject, currencyCode, shippingAddress) {
    // const shippingCosts = await getShippingCostsService(orderData.products);
    const requestBody = await getCreatePaypalOrderBody(
        orderObject,
        currencyCode,
        shippingAddress
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
