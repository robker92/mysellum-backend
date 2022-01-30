export { validateUpdateOneResult };

/**
 * Checks if the updateOne operation of the mongodb was successful
 * @param {object} result the updateOne result of mongodb
 * @param {string} entity
 * @param {object} queryObject
 * @param {object} updateObject
 * @returns true when a document was updated correctly and false if not
 */
function validateUpdateOneResult(result, entity, queryObject, updateObject) {
    if (result.result.n === 0) {
        console.log(JSON.stringify(result));
        console.log(JSON.stringify(entity));
        console.log(JSON.stringify(queryObject));
        console.log(JSON.stringify(updateObject));
    }

    if (
        result.result.n !== 0 &&
        result.result.ok !== 0
        // result.result.nModified !== 0
    ) {
        return;
    } else {
        throw new Error(
            `There was an error during a database update operation for the entity ${entity} with the query ${JSON.stringify(
                queryObject
            )} and the set object ${JSON.stringify(updateObject)}.`
        );
    }
}
