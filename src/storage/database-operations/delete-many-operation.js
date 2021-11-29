'use strict';
import { validateDeleteManyResult } from '../utils/validate-delete-many-result';
import { switchCollections } from '../utils/switch-collections';
import { checkForObjectId } from '../utils/check-for-object-id';

export { deleteManyOperation };

/**
 * Deletes n entities by the provided queryObject
 * @param {string} entity
 * @param {object} queryObject
 * @param {string} session mongo db session if needed
 * @returns true when at least one entity was deleted and false if not
 */
async function deleteManyOperation(entity, queryObject, session = null) {
    const collection = switchCollections(entity);

    queryObject = checkForObjectId(queryObject);

    let result;
    if (!session) {
        result = await collection.deleteMany(queryObject);
    } else {
        result = await collection.deleteMany(queryObject, {
            session,
        });
    }

    return validateDeleteManyResult(result);
}
