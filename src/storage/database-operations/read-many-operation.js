'use strict';
import { switchCollections } from '../utils/switch-collections';
import { checkForObjectId } from '../utils/check-for-object-id';

export { readManyOperation };

/**
 * Fetches an entity from the database by the provided queryObject
 * @param {string} entity
 * @param {object} queryObject
 * @param {object} projectionObject
 * @returns true when a user was updated and false if not
 */
async function readManyOperation(entity, queryObject, projectionObject = {}) {
    const collection = switchCollections(entity);

    queryObject = checkForObjectId(queryObject);

    const projection = { projection: projectionObject };

    const result = await collection.find(queryObject, projection).toArray();

    return result;
}
