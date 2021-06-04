'use strict';
import { validateUpdateOneAndReturnResult } from '../utils/validate-update-one-and-return-result';
import { switchCollections } from '../utils/switch-collections';
import { checkForObjectId } from '../utils/check-for-object-id';

export { updateOneAndReturnOperation };

/**
 * Updates an entity by the provided queryObject
 * @param {string} entity the database entity
 * @param {object} queryObject the query object
 * @param {object} updateObject the update object
 * @param {string} type e.g. set, inc
 * @param {string} session mongo db session if needed
 * @returns true when a user was updated and false if not
 */
async function updateOneAndReturnOperation(
    entity,
    queryObject,
    updateObject,
    type = 'set',
    returnOriginalValue = false,
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
        case 'pull':
            operation = { $pull: updateObject };
            break;
        default:
            operation = { $set: updateObject };
            break;
    }

    const returnOriginalObject = {
        returnOriginal: returnOriginalValue,
    };

    let result;
    if (!session) {
        result = await collection.findOneAndUpdate(
            queryObject,
            operation,
            returnOriginalObject
        );
    } else {
        result = await collection.findOneAndUpdate(
            queryObject,
            operation,
            returnOriginalObject,
            {
                session,
            }
        );
    }

    return validateUpdateOneAndReturnResult(
        result,
        entity,
        queryObject,
        updateObject
    );
}
