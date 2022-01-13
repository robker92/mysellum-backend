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
    const addressString = createAddressString(address);

    const geoCodeResult = await geoCoder.geocode(addressString);

    // throw error when address was not found
    if (geoCodeResult.length === 0) {
        throw new Error(
            `The provided address was not found and is therefore invalid: ${addressString}`
        );
    }

    return;
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
