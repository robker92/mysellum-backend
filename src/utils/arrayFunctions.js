function removeDuplicatesFromArray(array) {
    return array.filter((value, index) => array.indexOf(value) === index);
}

/**
 * Case Sensitive!
 * @param {*} array the array in which the value is searched
 * @param {*} value the value which should be searched
 * @returns true if found; false if not
 */
function valueExistsInArray(array, value) {
    return array.includes(value);
}

/**
 *
 * @param {Array} array the array in which the value is searched
 * @param {String} objectKey the object key for the object which should contain the value
 * @param {*} value the value which should be searched
 * @returns true if found; false if not
 */
function valueExistsInObjectArray(array, objectKey, value) {
    return array.some(function (element) {
        return element[objectKey] === value;
    });
}

/**
 *
 * @param {Array} array the array in which the value is searched
 * @param {String} objectKey the object key for the object  which should contain the value
 * @param {*} value the value which should be searched
 * @returns the object if found or undefined if not
 */
function findObjectInObjectArray(array, objectKey, value) {
    let obj = array.find((element) => element[objectKey] === value);
    return obj;
}

export { removeDuplicatesFromArray, valueExistsInArray, valueExistsInObjectArray, findObjectInObjectArray };
