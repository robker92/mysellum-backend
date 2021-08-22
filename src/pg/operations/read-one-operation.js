'use strict';
import { getModel } from './utils/get-model';

export { seqReadOneOperation };

/**
 * Fetches a single entity from the database by the provided queryObject
 * @param {string} model values: user,
 * @param {object} whereQuery e.g. { id: 1 }
 * @returns the user or an empty object if nothing was not found
 */
async function seqReadOneOperation(model, whereQuery) {
    const dbModel = getModel(model);

    const result = await dbModel.findOne({
        where: whereQuery,
        attributes: { exclude: [] },
    });

    return result;
}
