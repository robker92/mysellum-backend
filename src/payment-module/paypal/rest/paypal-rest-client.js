'use strict';

import axios from 'axios';

import { getPartnerReferralBody } from '../bodys/partner-referral-body';
import { getCreateOrderBody } from '../bodys/create-order-body';
import { getAccessToken } from './paypal-access-token';
import { PAYPAL_BASE_URL, PAYPAL_CLIENT_ID } from '../../../config';
import { v4 as uuidv4 } from 'uuid';

export {
    createSignUpLink,
    createPaypalOrder,
    capturePaypalOrder,
    refundPaypalOrder,
};

const paypalClient = axios.create({
    baseURL: PAYPAL_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 20000,
    withCredentials: true,
});

/**
 * Creates the Sign Up Link via a post request (+ access token) to paypal and returns the complete request data
 * @param {String} returnLink link to which the user will be redirected after he finished the onboarding process
 * @param {String} trackingId id which will be used to track the onboarding status; = our store id
 */
async function createSignUpLink(returnLink, trackingId) {
    const requestBody = getPartnerReferralBody(returnLink, trackingId);

    let response;
    try {
        const accessToken = await getAccessToken();
        // console.log(`hi2`);
        console.log(requestBody);
        response = await paypalClient.post(
            `/v2/customer/partner-referrals`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    } catch (error) {
        // console.log(error);
        throw error;
    }
    return response.data;
}

/**
 * Creates a paypal order via a post request
 * @param {Object} order Order object which will be used to create the order; required fields:
 */
async function createPaypalOrder(orderData) {
    // const testEmail = 'sb-b10wx5264762@personal.example.com';
    const requestBody = getCreateOrderBody(
        orderData.currency,
        orderData.totalSum,
        orderData.userEmail,
        'EUR',
        '10.00'
    );
    console.log(JSON.stringify(requestBody));
    const accessToken = await getAccessToken();

    // calculate platform fees

    let response;
    try {
        response = await paypalClient.post(`/v2/checkout/orders`, requestBody, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                //'PayPal-Partner-Attribution-Id': '',
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
    return response.data;
}

/**
 * Performs the post request to the
 * @param {String} orderId
 */
async function capturePaypalOrder(orderId) {
    const accessToken = await getAccessToken();

    let response;
    try {
        response = await paypalClient.post(
            `/v2/checkout/orders/${orderId}/capture`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    //'PayPal-Partner-Attribution-Id': '',
                },
            }
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
    return response.data;
}

// https://developer.paypal.com/docs/platforms/manage-risk/issue-refund/
/**
 * The function takes the captureId, value and currencyCode and performs the api request to paypal to refund
 * the products.
 * @param {string} captureId
 * @param {string} value
 * @param {string} currencyCode
 */
async function refundPaypalOrder(captureId, value, currencyCode) {
    const accessToken = await getAccessToken();
    const authAssertionHeader = getAuthAssertionHeader(sellerEmail);
    const paypalRequestId = uuidv4();

    let payload = value
        ? {
              amount: {
                  value: value,
                  currencyCode: currencyCode,
              },
          }
        : {};

    let response;
    try {
        response = await paypalClient.post(
            `/v2/payments/captures/${captureId}/refund`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'PayPal-Auth-Assertion': authAssertionHeader,
                    'PayPal-Request-Id': paypalRequestId,
                },
            }
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
}

function getAuthAssertionHeader(sellerEmail) {
    // const auth1 = btoa('{"alg":"none"}');
    const auth2Obj = { email: sellerEmail, iss: PAYPAL_CLIENT_ID };
    // const auth2 = btoa(JSON.stringify(auth2Obj));
    const authAssertionHeader =
        btoa('{"alg":"none"}') + '.' + btoa(JSON.stringify(auth2Obj)) + '.';
    return authAssertionHeader;
}
