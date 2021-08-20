'use strict';
import { getModel } from './utils/get-model';

export { readAndCountAllOperation };

/**
 * Fetches a single entity from the database by the provided queryObject
 * @param {string} model values: user,
 * @param {object} whereQuery e.g. { id: 1 }
 * @param {integer} offset
 * @param {integer} limit
 * @returns the user or an empty object if nothing was not found
 */
async function readAndCountAllOperation(
    model,
    whereQuery,
    offset = 0,
    limit = 100
) {
    const dbModel = getModel(model);

    const { count, rows } = await dbModel.findAndCountAll({
        where: whereQuery,
        offset: offset,
        limit: limit,
    });

    return { count, rows };
}
