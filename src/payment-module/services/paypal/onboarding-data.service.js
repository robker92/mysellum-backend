'use strict';

// database operations
import {
    readOneOperation,
    readManyOperation,
    updateOneOperation,
    createOneOperation,
    databaseEntity,
} from '../../../storage/database-operations';
import { PAYPAL_PLATFORM_MERCHANT_ID } from '../../../config';
import { paypalClient, getAccessToken } from './client/rest/paypal-rest-client';
import { storeActivationRoutine } from '../../../store-module/services/activation.service';

// MongoDB transaction
import { getMongoDbClient, getMongoDbTransactionWriteOptions } from '../../../storage/mongodb/setup';

export { onboardingDataService };

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
    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            // Validate Paypal Ids
            await validatePaypalMerchantId(merchantIdInPayPal);
            // Validate store id & store owner & check if values are not already set
            // save data to store (paypal + status)

            console.log(`Received store id: ${storeId}`);

            // Validate store id & check if values are not already set
            const store = await fetchAndValidateStoreForOnboarding(storeId, session);

            // User should be able to change connected paypal accounts -> check disabled
            // if (store.payment.paypal.common.merchantIdInPayPal) {
            //     throw new Error('There is already a merchantIdInPayPal stored for this store.');
            // }
            if (store.userEmail !== userEmail) {
                throw new Error('User not authorized to edit this store.');
            }

            // save data to store (paypal + status)
            await updateOneOperation(
                databaseEntity.STORES,
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
                'set',
                session
            );

            await storeActivationRoutine(store, session);
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
    }

    // try {
    //     // Validate Paypal Ids
    //     await validatePaypalMerchantId(merchantIdInPayPal);
    //     // Validate store id & store owner & check if values are not already set
    //     // save data to store (paypal + status)

    //     // TODO check activation
    //     console.log(`Received store id: ${storeId}`);
    //     // Validate store id & check if values are not already set
    //     const store = await fetchAndValidateStoreForOnboarding(storeId);
    //     if (store.payment.paypal.common.merchantIdInPayPal) {
    //         throw new Error('There is already a merchantIdInPayPal stored for this store.');
    //     }
    //     if (store.userEmail !== userEmail) {
    //         throw new Error('User not authorized to edit this store.');
    //     }

    //     // save data to store (paypal + status)
    //     await updateOneOperation(
    //         databaseEntity.STORES,
    //         {
    //             _id: storeId,
    //         },
    //         {
    //             'payment.registered': true,
    //             'payment.paypal.common.merchantId': merchantId,
    //             'payment.paypal.common.merchantIdInPayPal': merchantIdInPayPal,
    //             'payment.paypal.common.permissionsGranted': permissionsGranted,
    //             'payment.paypal.common.consentStatus': consentStatus,
    //             'payment.paypal.common.productIntentId': productIntentId,
    //             'payment.paypal.common.productIntentID': productIntentID,
    //             'payment.paypal.common.consentStatus': consentStatus,
    //             'payment.paypal.common.isEmailConfirmed': isEmailConfirmed,
    //             'payment.paypal.common.accountStatus': accountStatus,
    //             'activationSteps.paymentMethodRegistered': true,
    //         },
    //         'set'
    //     );

    //     await storeActivationRoutine(store, session);
    // } catch (error) {
    //     console.log(error);
    //     throw error;
    // }

    return;
}

/**
 * The function checks if the provided merchant id exists in paypal and is therefore valid.
 * An error is thrown, when the status code from paypal is 404 - Not Found.
 * @param {string} merchantIdInPaypal provide an empty string to use the tracking id in query.
 * If provided, it will be used to get the entity from paypal
 * @param {string} trackingId the tracking id which should be used as query param
 */
async function validatePaypalMerchantId(merchantIdInPaypal, trackingId) {
    if (!merchantIdInPaypal) {
        throw new Error(`Invalid merchantIdInPaypal parameter.`);
    }

    let url = `/v1/customer/partners/${PAYPAL_PLATFORM_MERCHANT_ID}/merchant-integrations`;
    url = merchantIdInPaypal ? url + `/${merchantIdInPaypal}` : url + `?tracking_id=${trackingId}`;
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

    // throw error when merchant id does not exist
    if (response.status === 404) {
        throw new Error('Invalid Paypal Merchant Id provided.');
    }

    return;
}

/**
 * The function fetches a store and returns it. When the id is invalid, an error is thrown
 * @param {string} storeId
 * @param {string} session mongo db session if needed
 */
async function fetchAndValidateStoreForOnboarding(storeId, session = null) {
    const findResult = await readOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {},
        session
    );

    if (!findResult) {
        throw new ValidationError(`A store with the store id ${storeId} could not be found.`);
    }

    if (findResult.deleted) {
        throw new ValidationError(`The store with the store id ${storeId} has been deleted.`);
    }

    return findResult;
}
