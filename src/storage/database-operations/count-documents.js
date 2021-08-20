'use strict';
import { switchCollections } from '../utils/switch-collections';
// import { checkForObjectId } from '../utils/check-for-object-id';

export { countDocumentsOperation };

/**
 * Fetches an entity from the database by the provided queryObject
 * @param {string} entity
 * @param {object} queryObject
 * @param {object} projectionObject
 * @returns true when a user was updated and false if not
 */
async function countDocumentsOperation(entity, queryObject) {
    const collection = switchCollections(entity);
    // console.log(queryObject);
    const result = await collection.countDocuments(queryObject);

    return result;
}
