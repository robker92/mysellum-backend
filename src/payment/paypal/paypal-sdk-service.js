import * as paypal from '@paypal/checkout-server-sdk';
import { PAYPAL_BN_CODE } from '../../config';
import { paypalClient } from './paypal-sdk-client';
import { getCreateOrderBody } from './bodys/create-order-body';

import { createOrderDataStructure } from '../internal/controller_orders';
export { createPaypalOrder, capturePaypalOrder };

/**
 * Creates the Paypal Order using the Paypal Checkout SDK
 * @param {Object} orderData the input data which was send from the frontend
 */
async function createPaypalOrder(orderData) {
    console.log(orderData);
    const requestBody = await getCreateOrderBody(orderData);
    console.log(JSON.stringify(requestBody));

    const request = new paypal.orders.OrdersCreateRequest();
    request.headers['PayPal-Partner-Attribution-Id'] = PAYPAL_BN_CODE;
    // request.prefer('return=representation');
    request.requestBody(requestBody);

    const order = await paypalClient().execute(request);

    // Return the order id
    return order.result.id;
}

/**
 * Capture the created order
 * @param {String} orderId the id of the before created order
 */
async function capturePaypalOrder(orderId, orderData) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    // Test the flow when of a failing funding source
    // request.headers[
    //     'PayPal-Mock-Response'
    // ] = `{'mock_application_codes': 'INSTRUMENT_DECLINED'}`;
    request.headers['PayPal-Partner-Attribution-Id'] = PAYPAL_BN_CODE;
    request.requestBody({});
    const capture = await paypalClient().execute(request);

    // 4. Save the capture ID to your database. Implement logic to save capture to your database for future reference.
    const captureId = capture.result.purchase_units[0].payments.captures[0].id;
    // await database.saveCaptureID(captureID);

    return captureId;
}
