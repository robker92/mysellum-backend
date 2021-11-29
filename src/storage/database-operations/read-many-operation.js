'use strict';
import { switchCollections } from '../utils/switch-collections';
import { checkForObjectId } from '../utils/check-for-object-id';

export { readManyOperation };

/**
 * Fetches an entity from the database by the provided queryObject
 * @param {string} entity
 * @param {object} queryObject
 * @param {object} projectionObject
 * @param {string} session mongo db session if needed
 * @returns true when a user was updated and false if not
 */
async function readManyOperation(
    entity,
    queryObject,
    projectionObject = {},
    sortObject = {},
    session = null
) {
    const collection = switchCollections(entity);

    queryObject = checkForObjectId(queryObject);

    let options = { projection: projectionObject, sort: sortObject };

    if (session) {
        options.session = session;
    }

    const result = await collection.find(queryObject, options).toArray();

    return result;
}
