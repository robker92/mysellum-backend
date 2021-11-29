'use strict';

import { getPartnerReferralBody } from '../../models';
import { paypalClient, getAccessToken } from './client/rest/paypal-rest-client';
import { PAYPAL_CLIENT_ID, PAYPAL_PLATFORM_MERCHANT_ID } from '../../../config';
import { v4 as uuidv4 } from 'uuid';

export { createSignUpLinkService };

/**
 * Creates the Sign Up Link via a post request (+ access token) to paypal and returns the complete request data
 * @param {String} returnLink link to which the user will be redirected after he finished the onboarding process
 * @param {String} trackingId id which will be used to track the onboarding status; = our store id
 */
async function createSignUpLinkService(returnLink, trackingId) {
    const requestBody = getPartnerReferralBody(returnLink, trackingId);

    let response;
    try {
        const accessToken = await getAccessToken();

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
        console.log(error);
        throw error;
    }
    return response.data;
}
