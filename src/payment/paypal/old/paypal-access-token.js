'use strict';

import axios from 'axios';
import qs from 'qs';

import {
    PAYPAL_BASE_URL,
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
} from '../../../config';

export { getAccessToken };

let cachedAccessToken = {
    accessToken: 'invalid',
    expiresAt: '',
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
 * Fetches the access token using the Paypal App Client Id and Secret
 * @returns the response body of the token request
 */
async function fetchAccessToken() {
    let response;
    try {
        const data = qs.stringify({
            grant_type: 'client_credentials',
        });
        response = await paypalClient.post(`/v1/oauth2/token`, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': 'en_US',
            },
            auth: {
                username: PAYPAL_CLIENT_ID,
                password: PAYPAL_CLIENT_SECRET,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
    return response.data; //return the response body
}

/**
 * Returns the access token. When the token is expired, it will be refreshed before.
 * @returns the access token
 */
async function getAccessToken() {
    if (
        !cachedAccessToken.expiresAt ||
        Date.now() >= parseFloat(cachedAccessToken.expiresAt)
    ) {
        console.log('access token is refreshed');
        const tokenResponse = await fetchAccessToken();
        cachedAccessToken.accessToken = tokenResponse.access_token; // get token from whole response body
        // calculation of the expiration time in ms
        cachedAccessToken.expiresAt =
            Date.now() + tokenResponse.expires_in - 2000; // (we distract 2 seconds to make sure that no invalid token is used for a request)
    }

    return cachedAccessToken.accessToken;
}
