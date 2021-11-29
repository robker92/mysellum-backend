'use strict';

import { databaseEntity } from '../../../storage/utils/database-entity';
import { readOneOperation } from '../../../storage/database-operations/read-one-operation';

export { fetchAndValidateStore, fetchAndValidateProduct, validateStoreOwner };

/**
 * Fetches a store by its storeId and returns it. Throws an error if the store was not found.
 * @param {string} storeId
 * @param {string} session mongo db session if needed
 */
async function fetchAndValidateStore(storeId, session = null) {
    const findResult = await readOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        {},
        session
    );
    if (!findResult) {
        throw new Error(`Store with the id ${storeId} not found.`);
    }
    return findResult;
}

/**
 * The function fetches the product and throws an error if the id was not found
 * @param {string} id the id of the product which should be validated
 * @param {string} session mongo db session if needed
 */
async function fetchAndValidateProduct(id, session = null) {
    const findResult = await readOneOperation(
        'products',
        {
            _id: id,
        },
        { imageDetails: 0, imgSrc: 0 },
        session
    );
    if (!findResult) {
        throw new Error(`Wrong product id (${id}) provided!`);
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

async function validateAndAdjustShoppingCart(shoppingCart) {
    // iterate over shopping cart
    // check if product exists
    // if yes, continue
    // if not, remove product from shopping cart
    for (const element of shoppingCart) {
    }
}
