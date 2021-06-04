// database operations
import {
    updateOneOperation,
    databaseEntity,
} from '../../storage/database-operations';

export {
    setActivationMinOneProduct,
    setActivationProfileComplete,
    setActivationShippingRegistered,
    setActivationPaymentMethodRegistered,
};

/**
 * The function sets the acivation step minOneProduct according to the provided value
 * @param {string} storeId the store's id which step should be set
 * @param {boolean} value the boolean value of the step
 */
async function setActivationMinOneProduct(storeId, value) {
    await updateOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {
            'activationSteps.minOneProduct': value,
        },
        'set'
    );
    return;
}

/**
 * The function sets the acivation step profileComplete according to the provided value
 * @param {string} storeId the store's id which step should be set
 * @param {boolean} value the boolean value of the step
 */
async function setActivationProfileComplete(storeId, value) {
    await updateOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {
            'activationSteps.profileComplete': value,
        },
        'set'
    );
    return;
}

/**
 * The function sets the acivation step shippingRegistered according to the provided value
 * @param {string} storeId the store's id which step should be set
 * @param {boolean} value the boolean value of the step
 */
async function setActivationShippingRegistered(storeId, value) {
    await updateOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {
            'activationSteps.shippingRegistered': value,
        },
        'set'
    );
    return;
}

/**
 * The function sets the acivation step paymentMethodRegistered according to the provided value
 * @param {string} storeId the store's id which step should be set
 * @param {boolean} value the boolean value of the step
 */
async function setActivationPaymentMethodRegistered(storeId, value) {
    await updateOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {
            'activationSteps.paymentMethodRegistered': value,
        },
        'set'
    );
    return;
}
