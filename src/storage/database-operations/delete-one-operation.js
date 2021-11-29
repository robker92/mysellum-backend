'use strict';
import { validateDeleteOneResult } from '../utils/validate-delete-one-result';
import { switchCollections } from '../utils/switch-collections';
import { checkForObjectId } from '../utils/check-for-object-id';

export { deleteOneOperation };

/**
 * Deletes an entity by the provided queryObject
 * @param {string} entity
 * @param {object} queryObject
 * @param {string} session mongo db session if needed
 * @returns true when an entity was deleted and false if not
 */
async function deleteOneOperation(entity, queryObject, session = null) {
    const collection = switchCollections(entity);

    queryObject = checkForObjectId(queryObject);
    let result;
    if (!session) {
        result = await collection.deleteOne(queryObject);
    } else {
        result = await collection.deleteOne(queryObject, {
            session,
        });
    }

    return validateDeleteOneResult(result);
}
