'use strict';
import NodeGeocoder from 'node-geocoder';
const geoCodeOptions = {
    provider: 'openstreetmap',
};
const geoCoder = NodeGeocoder(geoCodeOptions);

export { validateAddress };

/**
 * Checks if the provided address was found using the openstreetmap geocoder
 * @param {object} address
 * @returns throws error when address invalid
 */
async function validateAddress(address) {
    validateAddressFields(address);
    const addressString = createAddressString(address);

    const geoCodeResult = await geoCoder.geocode(addressString);

    // throw error when address was not found
    if (geoCodeResult.length === 0) {
        throw new Error(
            `The provided address was not found and is therefore invalid ${addressString}`
        );
    }

    return;
}

/**
 * Checks if the provided address has all the
 * @param {object} address
 * @returns throws error when address invalid
 */
function validateAddressFields(address) {
    // Check if the address object contains all keys
    if (
        !address.hasOwnProperty('firstName') ||
        !address.hasOwnProperty('lastName') ||
        !address.hasOwnProperty('addressLine1') ||
        !address.hasOwnProperty('postcode') ||
        !address.hasOwnProperty('city')
    ) {
        throw new Error(
            `The address object '${JSON.stringify(
                address
            )}' does not contain mandatory fields.`
        );
    }

    // Check if the address object values are of type string
    if (
        typeof address.firstName !== 'string' ||
        typeof address.lastName !== 'string' ||
        typeof address.addressLine1 !== 'string' ||
        typeof address.postcode !== 'string' ||
        typeof address.city !== 'string'
    ) {
        throw new Error(
            `The address object '${JSON.stringify(
                address
            )}' contains fields which are of the wrong data type.`
        );
    }

    // Check if the address object contains truthy values
    if (
        !address.firstName ||
        !address.lastName ||
        !address.addressLine1 ||
        !address.postcode ||
        !address.city
    ) {
        throw new Error(
            `The address object '${JSON.stringify(
                address
            )}' contains fields which have falsy values.`
        );
    }
}

/**
 * Creates and returns the needed address string for the geocoder
 * @param {object} address
 * @returns the address string
 */
function createAddressString(address) {
    let addressString = `${address.addressLine1}, ${address.postcode} ${address.city}, ${address.country}`;
    return addressString;
}
