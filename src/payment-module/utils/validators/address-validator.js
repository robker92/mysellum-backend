'use strict';
import NodeGeocoder from 'node-geocoder';
const geoCodeOptions = {
    provider: 'openstreetmap',
};
const geoCoder = NodeGeocoder(geoCodeOptions);

export { validateOrderAddress };

/**
 * Checks if the provided address was found using the openstreetmap geocoder
 * @param {object} address
 * @throws an error when address invalid
 * @returns the result object {latitude: "", longitude: "",country: "",city: "",state: "",zipcode: "",
 * streetName: "",streetNumber: "",countryCode: "",}
 */
async function validateOrderAddress(address) {
    const addressString = createAddressString(address);

    const geoCodeResult = await geoCoder.geocode(addressString);
    // console.log(geoCodeResult);
    // throw error when address was not found
    if (geoCodeResult.length === 0) {
        throw new Error(`The provided address was not found and is therefore invalid: ${addressString}`);
    }
    // check input country
    // if (address.country !== 'Deutschland' && address.country !== 'Germany' && address.country !== 'DE') {
    //     console.log(`hi1`);
    //     console.log(address.country);
    //     throw new Error(`Currently only Germany is supported.`);
    // }
    // check result country
    if (
        geoCodeResult[0].country !== 'Deutschland' ||
        (address.country !== 'Deutschland' && address.country !== 'Germany' && address.country !== 'DE')
    ) {
        throw new Error(`Currently only Germany is supported.`);
    }
    // throw new Error(`Currently only Germany is supported.`);
    return geoCodeResult[0];
}

/**
 * Creates and returns the needed address string for the geocoder
 * @param {object} address object in our format
 * @returns the address string
 */
function createAddressString(address) {
    let addressString = `${address.addressLine1}, ${address.postcode} ${address.city}, ${address.country}`;
    return addressString;
}
