'use strict';

import { databaseEntity } from '../../../storage/utils/database-entity';
import { readOneOperation } from '../../../storage/database-operations/read-one-operation';

export { fetchAndValidateStore, fetchAndValidateProduct, validateStoreOwner };

/**
 * Fetches a store by its storeId and returns it. Throws an error if the store was not found.
 * @param {string} storeId
 */
async function fetchAndValidateStore(storeId) {
    const findResult = await readOneOperation(databaseEntity.STORES, {
        _id: storeId,
    });
    if (!findResult) {
        throw new Error(`Store with the id ${storeId} not found.`);
    }
    return findResult;
}

/**
 * The function fetches the product and throws an error if the id was not found
 * @param {Object} orderedProduct
 */
async function fetchAndValidateProduct(id) {
    const findResult = await readOneOperation(
        'products',
        {
            _id: id,
        },
        { imageDetails: 0, imgSrc: 0 }
    );
    if (!findResult) {
        throw new Error(`Wrong product id (${orderedProduct._id}) provided!`);
    }
    return findResult;
}

/**
 * The function checks if the requesting user is indeed the store owner. Throws an error if this is not the case.
 * @param {string} userEmail
 * @param {string} storeOwnerEmail
 */
function validateStoreOwner(userEmail, storeOwnerEmail) {
    //Guard to make sure that only the store owner is able to edit this store
    if (storeOwnerEmail !== userEmail) {
        throw new Error(
            `User with the email address ${userEmail} unauthorized to edit this store.`
        );
    }
}
