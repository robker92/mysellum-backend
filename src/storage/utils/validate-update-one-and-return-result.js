export { validateUpdateOneAndReturnResult };

/**
 * Checks if the updateOne operation of the mongodb was successful
 * @param {object} result the updateOne result of mongodb
 * @param {string} entity
 * @param {object} queryObject
 * @param {object} updateObject
 * @returns true when a document was updated correctly and false if not
 */
function validateUpdateOneAndReturnResult(
    result,
    entity,
    queryObject,
    updateObject
) {
    if (result) {
        return result.value;
    } else {
        throw new Error(
            `There was an error during a database update and return operation for the entity ${entity} with the query ${JSON.stringify(
                queryObject
            )} and the set object ${JSON.stringify(updateObject)}.`
        );
    }
}
