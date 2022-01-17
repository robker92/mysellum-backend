import {
    removeDuplicatesFromArray,
    valueExistsInArray,
    valueExistsInObjectArray,
    findObjectInObjectArray,
} from './arrayFunctions';

export { getCountryCodeFromName, getNameFromCountryCode };

const SUPPORTED_COUNTRIES = [
    {
        code: 'DE',
        name_de: 'Deutschland',
        name_en: 'Germany',
    },
];

function getCountryCodeFromName(name, language) {
    findObjectInObjectArray(SUPPORTED_COUNTRIES, [], 'Germany');
}

function getNameFromCountryCode(code, language) {
    const countryObject = findObjectInObjectArray(SUPPORTED_COUNTRIES, [code], 'DE');
    if (!countryObject) {
        throw new Error(`The provided country code '${code}' is invalid or not supported.`);
    }

    if (language) return countryObject.name;
}
