'use strict';
import { getModel } from './utils/get-model';

export { seqReadManyOperation };

/**
 * Fetches all entity from the database by the provided queryObject
 * @param {string} model values: user,
 * @param {object} whereQuery
 * @param {object} excludeFieldsArray e.g. ["id", "password"], these fields will not be returned by the operation
 * @param {*} transaction a sequelize transaction
 * @returns the user or an empty object if nothing was not found
 */
async function seqReadManyOperation(
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

    const result = await dbModel.findAll(options);

    return result;
}
