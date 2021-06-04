export { checkIfInstrumentDeclined };

/**
 * Checks if the error is an INSTRUMENT_DECLINED error from paypal.
 * If yes, choosing the payment source will be redone
 * @param {error} error
 * @returns true when the error was found and false when not
 */
function checkIfInstrumentDeclined(error) {
    if (error._originalError) {
        if (
            JSON.parse(error._originalError?.text).details[0]?.issue ===
            'INSTRUMENT_DECLINED'
        ) {
            console.log(JSON.parse(error._originalError.text));
            res.status(error.statusCode).json(
                JSON.parse(error._originalError.text)
            );
            return true;
        }
    }
    return false;
}
