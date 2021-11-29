'use strict';
import { getModel } from './utils/get-model';

export { seqUpdateOperation };

/**
 * Updates a single entity and returns the updated one A transaction can be provided
 * @param {string} model values: user,
 * @param {object} valueObject objects which contains key/value pairs
 * @param {object} whereQuery e.g. {id: 1}
 * @param {*} transaction a sequelize transaction
 * @returns false, when no element was updated and returns the updated element itself when the update was successful
 */
async function seqUpdateOperation(
    model,
    valueObject,
    whereQuery,
    transaction = null
) {
    const dbModel = getModel(model);

    let options = {
        where: whereQuery,
        returning: true, // returns the updated object
        plain: true, // returns the object only without metadata
    };
    if (transaction) {
        options.transaction = transaction;
    }

    const result = await dbModel.update(valueObject, options);

    // The first number in the result array indicates how many rows were affected
    if (result[0] === 0) {
        return false;
    }

    return result[1];
}
