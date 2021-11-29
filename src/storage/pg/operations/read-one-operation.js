'use strict';
import { getModel } from './utils/get-model';

export { seqReadOneOperation };

/**
 * Fetches a single entity from the database by the provided queryObject
 * @param {string} model values: user,
 * @param {object} whereQuery e.g. { id: 1 }
 * @param {object} excludeFieldsArray e.g. ["id", "password"], these fields will not be returned by the operation
 * @param {*} transaction a sequelize transaction
 * @returns the user or an empty object if nothing was not found
 */
async function seqReadOneOperation(
    model,
    whereQuery,
    excludeFieldsArray = [],
    transaction = null
) {
    const dbModel = getModel(model);

    let options = {
        where: whereQuery,
        attributes: { exclude: excludeFieldsArray },
    };
    if (transaction) {
        options.transaction = transaction;
    }

    const result = await dbModel.findOne(options);

    return result;
}
