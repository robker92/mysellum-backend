'use strict';
// database operations
import {
    readOneOperation,
    updateOneOperation,
    updateOneAndReturnOperation,
    readManyOperation,
    deleteOneOperation,
    deleteManyOperation,
    createOneOperation,
    databaseEntity,
} from '../../storage/database-operations';

import {
    fetchAndValidateStore,
    fetchAndValidateProduct,
} from '../utils/operations/store-checks';

export {
    getShippingCostsService,
    calculateShippingCosts,
    getShippingCostForSingleStore,
};

async function getShippingCostsService(shoppingCart, userEmail) {
    // Create a data object which contains the shipping information of a store and the ordered products of that store
    const dataObject = await createStoreDataObject(shoppingCart);
    console.log(JSON.stringify(dataObject));

    // calculate order value per store
    const costs = calculateShippingCosts(dataObject);
    console.log(costs);

    return costs;
}

/**
 * The function creates a data Object out of the cart data ([[{ProductObject}, PurchasedAmount],[{ProductObject}, PurchasedAmount]])
 * Return data: { "storeId 1": {store: {shippingMethod: "", ...}, products: [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }}
 * @param {Array} cartArray [[{ProductObject}, PurchasedAmount],[{ProductObject}, PurchasedAmount]]
 */
async function createStoreDataObject(cartArray) {
    // Create a data structure like: { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }
    let orderObject = {};
    for (const element of cartArray) {
        const amount = element[1];
        const product = await fetchAndValidateProduct(element[0]._id);

        // Check if store id in order object, if not add it
        if (!(product.storeId in orderObject)) {
            // Validate if store id exists & fetch the store
            const store = await fetchAndValidateStore(product.storeId);
            // add store data and product to the orderObject

            orderObject[product.storeId] = {
                store: {
                    shippingMethod: store.shipping.method,
                    shippingThresholdValue: store.shipping.thresholdValue,
                    shippingCosts: store.shipping.costs,
                },
                products: [{ product: product, amount: amount }],
            };
            continue;
        }
        orderObject[product.storeId].products.push({
            product: product,
            amount: amount,
        });
    }
    return orderObject;
}

/**
 * This function receives the before created data object and calculates the total shipping costs
 * for the given shopping cart
 * @param {object} dataObject
 * @returns the shipping costs
 */
function calculateShippingCosts(dataObject) {
    let costs = 0;
    for (const storeElement in dataObject) {
        const store = dataObject[storeElement].store;
        const products = dataObject[storeElement].products;
        console.log(store);
        costs = costs + getShippingCostForSingleStore(store, products);
    }

    return costs.toFixed(2);
}

/**
 *
 * @param {object} store must at least contain shippingMethod, shippingThresholdValue and shippingCosts
 * @param {array} products
 */
function getShippingCostForSingleStore(store, products) {
    // if this store has the method free chosen, we simply move on to the next one
    if (store.shippingMethod === 'free') {
        return 0;
    }

    // if this store has the method threshold chosen
    if (store.shippingMethod === 'threshold') {
        // in this case we iterate over the products, because we need the total order value for this store
        let storeOrderValue = 0;
        for (const element of products) {
            storeOrderValue =
                storeOrderValue + element.product.priceFloat * element.amount;
        }
        console.log(storeOrderValue);
        // now we check if the total order value is below the stores defined threshold.
        // If yes, we add the store's shipping costs to the return value
        if (storeOrderValue < store.shippingThresholdValue) {
            return store.shippingCosts;
        }
        // Amount above threshold -> no shipping costs
        return 0;
    }

    // if this store has the method fixed, we add the store's shipping costs to our return value
    if (store.shippingMethod === 'fixed') {
        return store.shippingCosts;
    }
}
