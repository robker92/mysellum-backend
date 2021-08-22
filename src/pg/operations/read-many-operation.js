'use strict';
import { getModel } from './utils/get-model';

export { seqReadManyOperation };

/**
 * Fetches all entity from the database by the provided queryObject
 * @param {string} model values: user,
 * @param {object} whereQuery
 * @returns the user or an empty object if nothing was not found
 */
async function seqReadManyOperation(model, whereQuery) {
    const dbModel = getModel(model);

    const result = await dbModel.findAll({
        where: whereQuery,
        attributes: { exclude: [] },
    });

    return result;
}
