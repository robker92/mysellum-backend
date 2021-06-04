'use strict';
import { validateDeleteManyResult } from '../utils/validate-delete-many-result';
import { switchCollections } from '../utils/switch-collections';
import { checkForObjectId } from '../utils/check-for-object-id';

export { deleteManyOperation };

/**
 * Deletes n entities by the provided queryObject
 * @param {string} entity
 * @param {object} queryObject
 * @returns true when at least one entity was deleted and false if not
 */
async function deleteManyOperation(entity, queryObject) {
    const collection = switchCollections(entity);

    queryObject = checkForObjectId(queryObject);

    // const result = await collection.removeOne(queryObject);
    const result = await collection.deleteMany({
        storeId: storeId,
        productId: productId,
    });
    return validateDeleteManyResult(result);
}
