// database operations
import { updateOneOperation, readOneOperation, databaseEntity } from '../../storage/database-operations';

export { storeActivationRoutine, activationStep };

const activationStep = Object.freeze({
    PROFILE_COMPLETE: 'profileComplete',
    MIN_ONE_PRODUCT: 'minOneProduct',
    SHIPPING_REGISTERED: 'shippingRegistered',
    PAYMENT_REGISTERED: 'paymentMethodRegistered',
    LEGAL_DOCUMENTS_VALID: 'legalDocumentsValid',
});

/**
 * This is the main activation function, which is called whenever a relevant action took place which could affect the activation status of a store.
 * It checks first the activation status of every single step and then updates the general activation field.
 * @param {object} store
 * @param {string} mongoDbSession mongo db session if needed
 */
async function storeActivationRoutine(store, mongoDbSession = null) {
    if (!store) {
        // throw new Error(`Store with the id ${storeId} was not found.`);
        throw new Error(`No store was provided to check its activation status.`);
    }
    const storeId = store._id.toString();
    // PROFILE COMPLETE
    // Check the store's values and call the set methods accordingly
    const profileCompleteValue = checkProfileComplete(store);

    // MIN ONE PRODUCT
    const minOneProductValue = await checkMinOneProduct(storeId, mongoDbSession);

    // SHIPPING
    const shippingValue = checkShippingRegistered(store);

    // PAYMENT
    const paymentMethodValue = checkPaymentMethodRegistered(store);

    // LEGAL DOCUMENTS
    const legalDocumentsValue = checkLegalDocumentsValid(store);

    // get the value for the general actiovation status field
    const stepValueArray = [profileCompleteValue, minOneProductValue, shippingValue, paymentMethodValue];
    const activationValue = getGeneralActivationStatusValue(stepValueArray);

    // Build update object
    const updateObject = {};
    updateObject[`activationSteps.${activationStep.PROFILE_COMPLETE}`] = profileCompleteValue;
    updateObject[`activationSteps.${activationStep.MIN_ONE_PRODUCT}`] = minOneProductValue;
    updateObject[`activationSteps.${activationStep.SHIPPING_REGISTERED}`] = shippingValue;
    updateObject[`activationSteps.${activationStep.PAYMENT_REGISTERED}`] = paymentMethodValue;
    updateObject[`activationSteps.${activationStep.LEGAL_DOCUMENTS_VALID}`] = legalDocumentsValue;
    updateObject[`activation`] = activationValue;

    // Update the store's values
    await updateOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        updateObject,
        'set',
        mongoDbSession
    );
}

/**
 * Checks every element in the array. If one of them is false, false is returned.
 * If all of them are true, true is returned
 * @param {array} valueArray boolean array
 * @returns boolean value
 */
function getGeneralActivationStatusValue(valueArray) {
    let resultValue = false;
    for (const value of valueArray) {
        if (!value) {
            resultValue = false;
            break;
        } else {
            resultValue = true;
        }
    }

    return resultValue;
}

// Activation Step Validation Functions
function checkProfileComplete(store) {
    if (store.profileData.title.length < 10 || store.profileData.title.length > 100) {
        return false;
    }

    if (store.profileData.description.length < 100 || store.profileData.description.length > 10000) {
        return false;
    }

    if (store.profileData.tags.length < 1 || store.profileData.tags.length > 10) {
        return false;
    }

    if (store.profileData.images.length < 1 || store.profileData.images.length > 10) {
        return false;
    }

    return true;
}

async function checkMinOneProduct(storeId, mongoDbSession) {
    const product = await readOneOperation(databaseEntity.PRODUCTS, { storeId: storeId }, { _id: 1 }, mongoDbSession);
    if (!product) {
        return false;
    }
    return true;
}

function checkShippingRegistered(store) {
    if (
        store.shipping.method &&
        store.shipping.currency &&
        store.shipping.thresholdValue >= 0 &&
        store.shipping.thresholdValue >= 0
    ) {
        return true;
    }
    return false;
}

function checkPaymentMethodRegistered(store) {
    if (store.payment.paypal.common.merchantIdInPayPal && store.payment.registered) {
        return true;
    }
    return false;
}

function checkLegalDocumentsValid(store) {
    let agbFound = false;
    let dataPrivacyFound = false;

    for (const document of store.legalDocuments) {
        if (document.type === 'AGB') {
            agbFound = true;
        }
        if (document.type === 'Datenschutz') {
            dataPrivacyFound = true;
        }
        if (agbFound && dataPrivacyFound) {
            return true;
        }
    }

    return false;
}
