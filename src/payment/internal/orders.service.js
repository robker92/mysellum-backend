'use strict';
//App imports
import {
    getMongoDBClient,
    getMongoDBTransactionWriteOptions,
} from '../../mongodb/setup';

import { ObjectId } from 'mongodb';

import {
    getMongoProductsCollection,
    getMongoStoresCollection,
} from '../../mongodb/collections';

export { createOrderDataStructure };

/**
 * The function creates the order Object out of the cart data ([[{ProductObject}, PurchasedAmount],[{ProductObject}, PurchasedAmount]])
 * Return data: { "storeId 1": {store: {merchantId: ""}, products: [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }}
 * @param {Array} cartArray [[{ProductObject}, PurchasedAmount],[{ProductObject}, PurchasedAmount]]
 */
async function createOrderDataStructure(cartArray) {
    // Create a data structure like: { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }
    let orderObject = {};
    for (const element of cartArray) {
        const amount = element[1];
        const product = await fetchAndValidateProduct(element[0], amount);

        //Check if store id in order object, if not add it
        if (!(product.storeId in orderObject)) {
            //Validate if store id exists
            const store = await validateStoreId(product.storeId);
            // add store data and product to the orderObject
            orderObject[product.storeId] = {
                store: {
                    merchantId: '',
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
 * The function fetches a store and returns it. When the id is invalid, an error is thrown
 * @param {string} storeId
 */
async function validateStoreId(storeId) {
    const collectionStores = await getMongoStoresCollection();

    const findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });
    if (!findResult) {
        throw new Error('Wrong store id provided!');
    }
    return findResult;
}

/**
 * The function fetches the product and throws errors if it is out of stock or if the id was not found
 * @param {Object} orderedProduct
 * @param {number} orderedAmount
 */
async function fetchAndValidateProduct(orderedProduct, orderedAmount) {
    const collectionProducts = await getMongoProductsCollection();

    let findResult = await collectionProducts.findOne({
        _id: ObjectId(orderedProduct._id),
    });
    if (!findResult) {
        throw new Error('Wrong product id provided!');
    }
    if (orderedAmount > findResult.stockAmount) {
        throw new Error('Product out of stock!');
    }
    return findResult;
}
