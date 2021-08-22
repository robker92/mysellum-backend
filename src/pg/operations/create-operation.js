'use strict';
import { getModel } from './utils/get-model';

export { seqCreateOperation };

/**
 * Fetches a single entity from the database by the provided queryObject
 * @param {string} model values: user,
 * @param {object} valueObject e.g. { firstName: "Jane", lastName: "Doe" }
 * @returns the user or an empty object if nothing was not found
 */
async function seqCreateOperation(model, valueObject) {
    const dbModel = getModel(model);

    const result = await dbModel.create(valueObject);
    console.log(result);
    return result;
}
