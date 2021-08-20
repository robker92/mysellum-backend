'use strict';
import { getModel } from './utils/get-model';

export { deleteOneOperation };

/**
 * Fetches a single entity from the database by the provided queryObject
 * @param {string} model values: user,
 * @param {object} whereQuery e.g. { ID: 1 }
 * @returns true if the entity was successfully deleted, false if not
 */
async function deleteOneOperation(model, whereQuery) {
    const dbModel = getModel(model);

    const result = await dbModel.destroy({
        where: whereQuery,
    });
    console.log(result);

    if (result === 0) {
        return false;
    }

    return true;
}
