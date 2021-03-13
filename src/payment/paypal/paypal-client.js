'use strict';

import axios from 'axios';

import { getPartnerReferralBody } from './bodys/partner-referral-body';
import { getCreateOrderBody } from './bodys/create-order-body';
import { getAccessToken } from './paypal-access-token';
import { paypalBaseURL } from '../../config';

export { createSignUpLink, createPaypalOrder, capturePaypalOrder };

const paypalClient = axios.create({
    baseURL: paypalBaseURL,
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
    const accessToken = await getAccessToken();

    let response;
    try {
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
        console.log(error);
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
        await checkErrorForInvalidToken(error);
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
        await checkForInvalidToken(error);
        console.log(error);
        throw error;
    }
    return response.data;
}

// Hi Robert,

// Thank you for contacting PayPal Merchant Technical Support.
// I understand that you would like to setup a Marketplace and be able to pay multiple sellers at once.

// You can have multiple items added to any payment request, and then your server can send a payout to pay multiple sellers at once.

// https://developer.paypal.com/docs/platforms/

// https://developer.paypal.com/docs/platforms/make-payments/

// This is a demo of the PayPal Commerce Platform, it includes all the api requests and responses:
// https://demo.paypal.com/gb/demo/go_platform/partners/home?

// I apologize for the inconvenience this issue has caused.
// Thank you for using PayPal and have a wonderful day!

// Sincerely,

// Jennifer
// Global Technical Support
// PayPal, Inc.
