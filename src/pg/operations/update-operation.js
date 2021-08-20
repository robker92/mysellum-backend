'use strict';
import { getModel } from './utils/get-model';

export { updateOperation };

/**
 * Fetches all entity from the database by the provided queryObject
 * @param {string} model values: user,
 * @param {object} updateObject objects which contains key/value pairs
 * @param {object} whereQuery e.g. {id: 1}
 * @returns false, when no element was updated and returns the updated element itself when the update was successful
 */
async function updateOperation(model, updateObject, whereQuery) {
    const dbModel = getModel(model);

    const result = await dbModel.update(updateObject, {
        where: whereQuery,
        returning: true, // returns the updated object
        plain: true, // returns the object only without metadata
    });

    // The first number in the result array indicates how many rows were affected
    if (result[0] === 0) {
        return false;
    }

    return result[1];
}
