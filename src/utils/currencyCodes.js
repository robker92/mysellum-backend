export { getCurrencySymbol };

function getCurrencySymbol(currencyCode) {
    if (currencyCode === 'USD') {
        return '$';
    }
    if (currencyCode === 'EUR') {
        return '€';
    }
    return undefined;
}
