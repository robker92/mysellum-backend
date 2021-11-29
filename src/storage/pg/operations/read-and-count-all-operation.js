'use strict';
import { getModel } from './utils/get-model';

export { seqReadAndCountAllOperation };

/**
 * Fetches a single entity from the database by the provided queryObject
 * @param {string} model values: user,
 * @param {object} whereQuery e.g. { id: 1 }
 * @param {integer} offset
 * @param {integer} limit
 * @param {*} transaction a sequelize transaction
 * @returns the user or an empty object if nothing was not found
 */
async function seqReadAndCountAllOperation(
    model,
    whereQuery,
    offset = 0,
    limit = 100,
    transaction = null
) {
    const dbModel = getModel(model);

    let options = {
        where: whereQuery,
        offset: offset,
        limit: limit,
    };
    if (transaction) {
        options.transaction = transaction;
    }

    const { count, rows } = await dbModel.findAndCountAll(options);

    return { count, rows };
}
