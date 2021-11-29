export { validateDeleteOneResult };

/**
 * Checks if the elements n, ok and deletedCount of the MongoDb Result to the removeOne Operation are 1
 * @param {object} result the removeOne result of mongodb
 * @returns true when a document was deleted and false if not
 */
function validateDeleteOneResult(result) {
    if (
        result.result.n !== 0 &&
        result.result.ok !== 0
        // result.deletedCount !== 0
    ) {
        return true;
    } else {
        throw new Error(
            'Error during deletion operation! Element was not deleted.'
        );
    }
}
