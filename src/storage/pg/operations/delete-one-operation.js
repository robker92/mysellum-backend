'use strict';
import { getModel } from './utils/get-model';

export { seqDeleteOneOperation };

/**
 * Fetches a single entity from the database by the provided queryObject. A transaction can be provided
 * @param {string} model values: user,
 * @param {object} whereQuery e.g. { ID: 1 }
 * @param {*} transaction a sequelize transaction
 * @returns true if the entity was successfully deleted, false if not
 */
async function seqDeleteOneOperation(model, whereQuery, transaction = null) {
    const dbModel = getModel(model);

    let options = {
        where: whereQuery,
    };
    if (transaction) {
        options.transaction = transaction;
    }

    const result = await dbModel.destroy(options);
    console.log(result);

    if (result === 0) {
        return false;
    }

    return true;
}
