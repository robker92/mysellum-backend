import { contentType } from '../enums/contentType';

export { validateContentType };

/**
 * Checks if the provided content type is among the supported content type. Throws an error if
 * an invalid one has been provided.
 * @param {string} contentTypeToValidate
 */
function validateContentType(contentTypeToValidate) {
    const contentTypeArray = Object.values(contentType);
    if (!contentTypeArray.includes(contentTypeToValidate)) {
        throw new Error(
            `The provided contentType ${contentTypeToValidate} is not among the allowed values.`
        );
    }
    return;
}
