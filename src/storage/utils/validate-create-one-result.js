export { validateCreateOneResult };

/**
 * Checks if the insertOne operation of the mongodb was successful
 * @param {object} result the insertOne result of mongodb
 * @returns true when a document was inserted correctly and false if not
 */
function validateCreateOneResult(result) {
    if (
        result.result.n !== 0 &&
        result.result.ok !== 0
        // result.insertedCount !== 0
    ) {
        return result;
    } else {
        return false;
    }
}
