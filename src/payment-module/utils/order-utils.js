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
    getShippingCostsService,
    getShippingCostForSingleStore,
} from '../../store-module/services/shipping.service';

import { getOrderModel } from '../models/order-model';

export {
    createOrderDataStructure,
    validateStoreId,
    fetchAndValidateStore,
    fetchAndValidateProduct,
    createOrderArray,
    updateProductStockAmount,
    insertOrders,
    emptyShoppingCart,
};

async function validateStoreId(storeId) {
    const collectionStores = await getMongoStoresCollection();
    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });
    if (!findResult) {
        throw new Error('Wrong store id provided!');
    }
    return;
}

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

        // Check if store id in order object, if not add it
        if (!(product.storeId in orderObject)) {
            // Validate if store id exists & fetch the store
            const store = await fetchAndValidateStore(product.storeId);
            console.log(store.payment.paypal.common.merchantId);
            // add store data and product to the orderObject
            orderObject[product.storeId] = {
                store: {
                    merchantIdInPayPal:
                        store.payment.paypal.common.merchantIdInPayPal,
                    merchantEmailInPayPal:
                        store.payment.paypal.common.merchantEmailInPayPal,
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
 * The function fetches a store and returns it. When the id is invalid, an error is thrown
 * @param {string} storeId
 */
async function fetchAndValidateStore(storeId) {
    const findResult = await readOneOperation(databaseEntity.STORES, {
        _id: storeId,
    });

    if (!findResult) {
        throw new Error(
            `A store with the store id ${storeId} could not be found.`
        );
    }
    return findResult;
}

/**
 * The function fetches the product and throws errors if it is out of stock (compared to the ordered amount)
 * or if the id was not found
 * @param {Object} orderedProduct
 * @param {number} orderedAmount
 */
async function fetchAndValidateProduct(orderedProduct, orderedAmount) {
    const findResult = await readOneOperation(
        'products',
        {
            _id: orderedProduct._id,
        },
        { imageDetails: 0, imgSrc: 0 }
    );

    if (!findResult) {
        throw new Error(`Wrong product id (${orderedProduct._id}) provided!`);
    }
    // Check if product is out of stock
    if (orderedAmount > findResult.stockAmount) {
        throw new Error(
            `Product (${findResult._id}; ${findResult.title}) out of stock!`
        );
    }

    // Remove the stock Amount from the product, since we dont need it in the order
    delete findResult.stockAmount;

    return findResult;
}

/**
 * Creates an array which contains all the orders from the request in the order format
 * @param {object} orderObject
 * @param {object} orderData
 * @param {string} userEmail
 * @param {string} paypalOrderId
 * @returns
 */
function createOrderArray(orderObject, orderData, userEmail, paypalOrderId) {
    let orderArray = [];
    // iterate over stores
    const storeIds = Object.keys(orderObject);
    for (let i = 0; i < storeIds.length; i++) {
        const productArray = orderObject[storeIds[i]].products;

        const orderOptions = {
            arrayIndex: i,
            storeId: storeIds[i],
            userEmail: userEmail,
            datetimeCreated: new Date().toISOString(),
            datetimeAdjusted: '',
            shippingType: 'delivery',
            // products: productArray,
            currencyCode: orderData.currencyCode,
            totalSum: 0,
            billingAddress: orderData.billingAddress,
            shippingAddress: orderData.shippingAddress,
            paypalOrderId: paypalOrderId,
            paypalStatus: 'captured',
        };
        const order = getOrderModel(orderOptions);

        let totalProductSum = 0;
        // iterate over products to calculate the total sum and push the products to the order
        for (const element of productArray) {
            // for (let i = 0; i < productArray.length; i++) {
            // check if product exists and use it in the order
            // let product = await fetchAndValidateProduct(productArray[i]);
            // const product = productArray[i];
            order.products.push(element);
            totalProductSum =
                totalProductSum + element.product.priceFloat * element.amount;
        }

        // Calculation
        const totalTax = 0.0; // totalProductSum * 0.07;
        const platformFee = totalProductSum * 0.1;
        // const shippingCosts = 0.0; // value is configuered by store owner
        const shippingCosts = getShippingCostForSingleStore(
            orderObject[storeIds[i]].store,
            productArray
        );
        console.log(JSON.stringify(orderObject[storeIds[i]].store));
        console.log(`[SHIPPING] Costs for ${storeIds[i]} are ${shippingCosts}`);
        const transferAmount = totalProductSum - platformFee + shippingCosts;

        // to string
        order.totalSum = totalProductSum.toFixed(2);
        order.totalTax = totalTax.toFixed(2);
        order.platformFee = platformFee.toFixed(2);
        order.shippingCosts = shippingCosts.toFixed(2);
        order.transferAmount = transferAmount.toFixed(2);

        // console.log(`Order: ${JSON.stringify(order)}`);
        // push to order Array
        orderArray.push(order);
    }
    if (!orderArray.length) {
        throw new Error('Order Array is empty');
    }
    return orderArray;
}

/**
 * The function decreases the product stock amounts by the purchased amounts from the order
 * @param {object} orderObject the order object which contains
 * @param {*} mongoDbSession the mongo db session
 */
async function updateProductStockAmount(orderObject, mongoDbSession) {
    let updates = [];
    const storeIds = Object.keys(orderObject);
    for (const storeId of storeIds) {
        const productArray = orderObject[storeId].products;
        for (const element of productArray) {
            const update = updateOneOperation(
                'products',
                {
                    _id: element.product._id,
                },
                {
                    stockAmount: -element.amount, //reduce stock amount by purchased amount
                },
                'inc',
                mongoDbSession
            );
            updates.push(update);
        }
    }
    // Wait for all updates to be done
    await Promise.all(updates);

    return;
}

/**
 * The function inserts all the orders from the orderArray and uses promise.all to wait until all insertions are done
 * @param {array} orderArray the array which contains the orders
 * @param {*} mongoDbSession the mongo db session
 */
async function insertOrders(orderArray, mongoDbSession) {
    let insertions = [];
    for (const order of orderArray) {
        insertions.push(createOneOperation('orders', order, mongoDbSession));
    }

    // Wait for all insertions to be done
    await Promise.all(insertions);

    return;
}

/**
 * Sets the users shoppingcart to an empty array
 * @param {string} email
 * @param {*} mongoDbSession
 * @returns
 */
async function emptyShoppingCart(email, mongoDbSession) {
    await updateOneOperation(
        'users',
        {
            email: email,
        },
        {
            shoppingCart: [],
        },
        'set',
        mongoDbSession
    );
    return;
}

/**
 * The function undos the product decrease which was performed at the create order process step,
 * when an error occurred at the capture order process step
 * @param {string} paypalOrderId the paypal order id
 */
async function undoProductStockDecrease(paypalOrderId) {
    const order = await fetchAndValidateOrderByPaypalId(paypalOrderId);
    console.log(order);
    let promiseArray = [];
    for (const element of order.products) {
        const result = await updateOneOperation(
            'products',
            {
                _id: element.product._id,
            },
            {
                stockAmount: element.amount,
            },
            'inc'
        );

        promiseArray.push(result);
    }
    await Promise.all(promiseArray);
    return;
}

/**
 * The function fetches an order by its paypal order id and throws an error if no order was found
 * @param {string} paypalOrderId the paypal order id
 */
async function fetchAndValidateOrderByPaypalId(paypalOrderId) {
    const order = await readOneOperation('orders', {
        'payment.details.paypalOrderId': paypalOrderId,
    });

    if (!order) {
        throw new Error(`No order to the order id ${orderId} has been found.`);
    }
    return order;
}