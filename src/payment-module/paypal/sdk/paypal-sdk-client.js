'use strict';

import { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } from '../../../config';
import * as checkoutNodeJssdk from '@paypal/checkout-server-sdk';
export { paypalClient, prettyPrint };

/**
 * Returns PayPal HTTP client instance with environment that has access
 * credentials context. Use this instance to invoke PayPal APIs, provided the
 * credentials have access.
 */
function paypalClient() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

/**
 * Set up and return PayPal JavaScript SDK environment with PayPal access credentials.
 * This sample uses SandboxEnvironment. In production, use LiveEnvironment.
 */
function environment() {
    return new checkoutNodeJssdk.core.SandboxEnvironment(
        PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET
    );
}

/**
 * Pretty Prints a json objects (e.g. useful to see in console)
 * @param {Object} jsonData
 * @param {*} pre
 */
async function prettyPrint(jsonData, pre = '') {
    let pretty = '';
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
    for (let key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
            if (isNaN(key)) pretty += pre + capitalize(key) + ': ';
            else pretty += pre + (parseInt(key) + 1) + ': ';
            if (typeof jsonData[key] === 'object') {
                pretty += '\n';
                pretty += await prettyPrint(jsonData[key], pre + '    ');
            } else {
                pretty += jsonData[key] + '\n';
            }
        }
    }
    return pretty;
}
