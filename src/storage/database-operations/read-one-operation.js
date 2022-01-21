'use strict';
import { switchCollections } from '../utils/switch-collections';
import { checkForObjectId } from '../utils/check-for-object-id';

export { readOneOperation };

/**
 * Fetches an entity from the database by the provided queryObject
 * @param {string} entity
 * @param {object} queryObject
 * @param {object} projectionObject
 * @param {object} session mongo db session if needed
 * @returns the user or undefined/null if nothing was not found
 */
async function readOneOperation(entity, queryObject, projectionObject = {}, session = null) {
    const collection = switchCollections(entity);

    queryObject = checkForObjectId(queryObject);

    let options = { projection: projectionObject };

    if (session) {
        options.session = session;
    }

    const result = await collection.findOne(queryObject, options);

    return result;
}
