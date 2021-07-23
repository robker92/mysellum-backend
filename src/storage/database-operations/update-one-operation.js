'use strict';
import { validateUpdateOneResult } from '../utils/validate-update-one-result';
import { switchCollections } from '../utils/switch-collections';
import { checkForObjectId } from '../utils/check-for-object-id';

export { updateOneOperation };

/**
 * Updates an entity by the provided queryObject
 * @param {string} entity
 * @param {object} queryObject
 * @param {object} updateObject
 * @param {string} type e.g. set, inc
 * @param {string} session mongo db session if needed
 * @returns true when a user was updated and false if not
 */
async function updateOneOperation(
    entity,
    queryObject,
    updateObject,
    type = 'set',
    session = null
) {
    const collection = switchCollections(entity);

    queryObject = checkForObjectId(queryObject);

    let operation;
    switch (type) {
        case 'set':
            operation = { $set: updateObject };
            break;
        case 'inc':
            operation = { $inc: updateObject };
            break;
        case 'push':
            operation = { $push: updateObject };
            break;
        case 'pull':
            operation = { $pull: updateObject };
            break;
        default:
            operation = { $set: updateObject };
            break;
    }

    let result;
    if (!session) {
        result = await collection.updateOne(queryObject, operation);
    } else {
        // try {
        result = await collection.updateOne(queryObject, operation, {
            session,
        });
        // } catch (error) {
        //     console.log(error);
        // }
        // console.log(result);
    }
    // console.log(result);
    return validateUpdateOneResult(result, entity, queryObject, updateObject);
}
