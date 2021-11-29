import { currencyCode } from '../currencyCode';

export { validateCurrencyCode };

/**
 * Checks if the provided currency code is among the supported currency codes. Throws an error if
 * an invalid code has been provided.
 * @param {string} currencyCodeToValidate
 */
function validateCurrencyCode(currencyCodeToValidate) {
    const currencyCodeArray = Object.values(currencyCode);

    if (!currencyCodeArray.includes(currencyCodeToValidate)) {
        throw new Error(
            `The provided currencyCode ${currencyCodeToValidate} is not among the allowed values.`
        );
    }
    return;
}
