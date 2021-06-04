export { hasValidProperty, deepObjectCopy };

/**
 * The function checks of the object contains the provided property and
 * if the property's value is neither undefined nor null
 * @param {object} object the object which should contain the property
 * @param {any} property the property
 */
function hasValidProperty(object, property) {
    if (
        property in object &&
        object[property] !== undefined &&
        object[property] !== null
    ) {
        return true;
    }
    return false;
}

function deepObjectCopy(object) {
    return JSON.parse(JSON.stringify(object));
}
