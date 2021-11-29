'use strict';

import { getPartnerReferralBody, getCreateOrderBody } from '../models';
import {
    paypalClient,
    getAccessToken,
} from '../client/rest/paypal-rest-client';
import { PAYPAL_CLIENT_ID, PAYPAL_PLATFORM_MERCHANT_ID } from '../../config';
import { v4 as uuidv4 } from 'uuid';

export {
    createSignUpLinkService,
    validatePaypalMerchantId,
    fetchWebhookPaypalMerchantId,
    createPaypalOrder,
    capturePaypalOrder,
    refundPaypalOrder,
    onboardingDataService,
    onboardingData2Service,
    saveWebhookData,
    saveMerchantId,
    fetchMerchantIds,
    sendNotificationEmails,
};

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
 * The function checks if the provided merchant id exists in paypal and is therefore valid.
 * An error is thrown, when the status code from paypal is 404 - Not Found.
 * @param {string} merchantIdInPaypal provide an empty string to use the tracking id in query.
 * If provided, it will be used to get the entity from paypal
 * @param {string} trackingId the tracking id which should be used as query param
 */
async function validatePaypalMerchantId(merchantIdInPaypal, trackingId) {
    let url = `/v1/customer/partners/${PAYPAL_PLATFORM_MERCHANT_ID}/merchant-integrations`;
    url = merchantIdInPaypal
        ? url + `/${merchantIdInPaypal}`
        : url + `?tracking_id=${trackingId}`;
    // if (!merchantIdInPaypal) {
    //     url = url + `?tracking_id=${trackingId}`;
    // } else {
    //     url = url + `/${merchantIdInPaypal}`;
    // }

    let response;
    try {
        const accessToken = await getAccessToken();
        response = await paypalClient.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    }

    if (response.status === 404) {
        throw new Error('Invalid Paypal Merchant Id provided!');
    }

    if (!merchantIdInPaypal) {
        return;
    } else {
        return response.data;
    }
}

/**
 * The function gets the url from the webhook event data and fetches it. If the url is false, an error is thrown.
 * @param {string} url
 */
async function fetchWebhookPaypalMerchantId(url) {
    let response;
    try {
        const accessToken = await getAccessToken();
        response = await paypalClient.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
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

async function onboardingDataService(
    storeId,
    userEmail,
    merchantId,
    merchantIdInPayPal,
    permissionsGranted,
    consentStatus,
    productIntentId,
    productIntentID,
    isEmailConfirmed,
    accountStatus
) {
    console.log(`Received store id: ${storeId}`);
    // Validate store id & check if values are not already set
    const store = await fetchAndValidateStore(storeId);
    if (store.payment.paypal.common.merchantIdInPayPal) {
        throw new Error(
            'There is already a merchantIdInPayPal stored for this store.'
        );
    }
    if (store.userEmail !== userEmail) {
        throw new Error('User not authorized to edit this store.');
    }

    // save data to store (paypal + status)
    // TODO check status
    try {
        await updateOneOperation(
            'stores',
            {
                _id: storeId,
            },
            {
                'payment.registered': true,
                'payment.paypal.common.merchantId': merchantId,
                'payment.paypal.common.merchantIdInPayPal': merchantIdInPayPal,
                'payment.paypal.common.permissionsGranted': permissionsGranted,
                'payment.paypal.common.consentStatus': consentStatus,
                'payment.paypal.common.productIntentId': productIntentId,
                'payment.paypal.common.productIntentID': productIntentID,
                'payment.paypal.common.consentStatus': consentStatus,
                'payment.paypal.common.isEmailConfirmed': isEmailConfirmed,
                'payment.paypal.common.accountStatus': accountStatus,
                'activationSteps.paymentMethodRegistered': true,
            },
            'set'
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
    return;
}

/**
 * The function validates if the user is the owner of the store and it updates the store (= save the merchant id and updates the status)
 * @param {string} storeId
 * @param {string} userEmail
 * @param {string} merchantIdInPayPal
 * @returns
 */
async function onboardingData2Service(storeId, userEmail, merchantIdInPayPal) {
    // Validate store id & check if values are not already set
    const store = await fetchAndValidateStore(storeId);
    if (store.payment.paypal.common.merchantIdInPayPal) {
        throw new Error(
            'There is already a merchantIdInPayPal stored for this store.'
        );
    }
    if (store.userEmail !== userEmail) {
        throw new Error('User not authorized to edit this store.');
    }

    // save data to store (paypal + status)
    // TODO check status
    try {
        await updateOneOperation(
            'stores',
            {
                _id: storeId,
            },
            {
                'payment.paypal.common.merchantIdInPayPal': merchantIdInPayPal,
                'activationSteps.paymentMethodRegistered': true,
            },
            'set'
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
    return;
}

/**
 * The function saves the merchant id to the stoer with the provided tracking id (=store id)
 * @param {string} merchantId
 * @param {string} trackingId
 */
async function saveMerchantId(merchantId, trackingId) {
    const store = await fetchAndValidateStore(trackingId);
    if (store.payment.paypal.common.merchantIdInPayPal) {
        throw new Error(
            'There is already a merchantIdInPayPal stored for this store.'
        );
    }
    // console.log(merchantId);
    // console.log(trackingId);
    await updateOneOperation(
        'stores',
        {
            _id: trackingId,
        },
        {
            'payment.paypal.common.merchantIdInPayPal': merchantId,
            'activationSteps.paymentMethodRegistered': true,
        },
        'set'
    );

    return;
}

/**
 * The function saves the data object received from a paypal webhook.
 * @param {object} webhookData
 */
async function saveWebhookData(webhookData) {
    await createOneOperation('paypalWebhooks', webhookData);

    return;
}

/**
 * The function fetches all the stores which are contained in the shopping cart and returns a string
 * array which contains the merchant ids from paypal
 * @param {array} shoppingCart
 */
async function fetchMerchantIds(storeIds) {
    // console.log(storeIds);
    let merchantIdArray = [];
    for (const storeId of storeIds) {
        const store = await fetchAndValidateStore(storeId);
        // console.log(store.payment.paypal);
        merchantIdArray.push(store.payment.paypal.common.merchantIdInPayPal);
    }

    merchantIdArray = [...new Set(merchantIdArray)]; // remove duplicates

    return merchantIdArray;
}

async function sendNotificationEmails(customerEmail, captureArray) {
    let promises = [];
    // send customer notification
    let mailOptions = {
        email: customerEmail,
        contentType: contentType.ORDER_CREATED_CUSTOMER,
    };
    promises.push(sendNodemailerMail(mailOptions));

    for (const purchaseUnit of captureArray) {
        const storeId = purchaseUnit.paypalRefId.substring(
            0,
            purchaseUnit.paypalRefId.indexOf('~')
        );
        const store = await fetchAndValidateStore(storeId);
        let mailOptions = {
            email: store.userEmail,
            contentType: contentType.ORDER_CREATED_STORE,
        };
        promises.push(sendNodemailerMail(mailOptions));
    }
    Promise.all(promises);
}
