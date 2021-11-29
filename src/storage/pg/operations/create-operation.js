'use strict';
import { getModel } from './utils/get-model';

export { seqCreateOperation };

/**
 * Fetches a single entity from the database by the provided queryObject. A transaction can be provided
 * @param {string} model values: user,
 * @param {object} valueObject e.g. { firstName: "Jane", lastName: "Doe" }
 * @param {*} transaction a sequelize transaction
 * @returns the user or an empty object if nothing was not found
 */
async function seqCreateOperation(model, valueObject, transaction = null) {
    const dbModel = getModel(model);

    let options = {};
    if (transaction) {
        options.transaction = transaction;
    }

    const result = await dbModel.create(valueObject, options);

    // console.log(result);
    return result;
}
