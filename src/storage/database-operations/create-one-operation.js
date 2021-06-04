'use strict';
import { validateCreateOneResult } from '../utils/validate-create-one-result';
import { switchCollections } from '../utils/switch-collections';

export { createOneOperation };

/**
 * Creates an entity by the provided insertObject
 * @param {string} entity
 * @param {object} insertObject
 * @param {string} session mongo db session if needed
 * @returns true when a user was updated and false if not
 */
async function createOneOperation(entity, insertObject, session = null) {
    const collection = switchCollections(entity);

    let result;
    if (!session) {
        result = await collection.insertOne(insertObject);
    } else {
        result = await collection.insertOne(insertObject, { session });
    }
    // console.log(result);
    return validateCreateOneResult(result);
}
