'use strict';
import { validateDeleteOneResult } from '../utils/validate-delete-one-result';
import { switchCollections } from '../utils/switch-collections';
import { checkForObjectId } from '../utils/check-for-object-id';

export { deleteOneOperation };

/**
 * Deletes an entity by the provided queryObject
 * @param {string} entity
 * @param {object} queryObject
 * @returns true when an entity was deleted and false if not
 */
async function deleteOneOperation(entity, queryObject) {
    const collection = switchCollections(entity);

    queryObject = checkForObjectId(queryObject);

    const result = await collection.removeOne(queryObject);

    return validateDeleteOneResult(result);
}
