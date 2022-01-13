import { fetchAndValidateStore } from '../../utils/order-utils';

export { fetchMerchantIdsService };

async function fetchMerchantIdsService(storeIds) {
    let merchantIdArray;
    try {
        merchantIdArray = await fetchMerchantIds(storeIds);
    } catch (error) {
        console.log(error);
        throw error;
    }
    console.log(merchantIdArray);
    console.log(merchantIdArray.length);
    if (merchantIdArray.length <= 0) {
        throw new Error(`No merchant ids could be fetched.`);
    }

    return merchantIdArray;
}

/**
 * The function fetches all the store's merchant ids which are contained in the shopping cart and returns a string
 * array which contains the merchant ids from paypal
 * @param {array} shoppingCart
 */
async function fetchMerchantIds(storeIds) {
    // console.log(storeIds);
    let merchantIdArray = [];
    for (const storeId of storeIds) {
        const store = await fetchAndValidateStore(storeId);
        // console.log(store.payment.paypal);
        merchantIdArray.push(store.payment.paypal.common.merchantIdInPayPal);
    }

    merchantIdArray = [...new Set(merchantIdArray)]; // remove duplicates

    return merchantIdArray;
}
