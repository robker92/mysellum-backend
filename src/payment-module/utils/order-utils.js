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
import { getShippingCostsService, getShippingCostForSingleStore } from '../../store-module/services/shipping.service';
import { ValidationError } from '../errors/validation-error';
import { getOrderModel } from '../models/order-model';
import { PLATFORM_FEE_RATE_DEFAULT } from '../../config';

export {
    createOrderDataStructure,
    validateStoreId,
    fetchAndValidateStore,
    fetchAndValidateProduct,
    createOrderArray,
    updateProductStockAmount,
    insertOrders,
    emptyShoppingCart,
    getStorePlatformFeeRate,
    calculateProductTax,
    calculateShippingTax,
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
 * @param {String} deliveryMethod delivery or pickup
 */
async function createOrderDataStructure(cartArray, deliveryMethod) {
    // Create a data structure like: { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }
    let orderObject = {};
    for (const element of cartArray) {
        const amount = element[1];
        const product = await fetchAndValidateProduct(element[0], amount, deliveryMethod);

        // Check if store id in order object, if not add it
        if (!(product.storeId in orderObject)) {
            // Validate if store id exists & fetch the store
            const store = await fetchAndValidateStore(product.storeId);
            console.log(store.payment.paypal.common.merchantId);
            // add store data and product to the orderObject
            orderObject[product.storeId] = {
                store: {
                    merchantIdInPayPal: store.payment.paypal.common.merchantIdInPayPal,
                    merchantEmailInPayPal: store.payment.paypal.common.merchantEmailInPayPal,
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
        throw new ValidationError(`A store with the store id ${storeId} could not be found.`);
    }

    if (findResult.deleted) {
        throw new ValidationError(`The store with the store id ${storeId} has been deleted.`);
    }

    if (!findResult.adminActivation) {
        throw new ValidationError(
            `The store with the store id ${storeId} has not been activated yet or has been deactivated by the admins.`
        );
    }

    if (!findResult.userActivation) {
        throw new ValidationError(`The store with the store id ${storeId} has been deactivated by the owner.`);
    }

    if (!findResult.activation) {
        throw new ValidationError(`The store with the store id ${storeId} has not been activated yet.`);
    }

    return findResult;
}

/**
 * The function fetches the product and throws errors if it is out of stock (compared to the ordered amount)
 * or if the id was not found
 * @param {Object} orderedProduct
 * @param {number} orderedAmount
 * @param {String} deliveryMethod delivery or pickup
 */
async function fetchAndValidateProduct(orderedProduct, orderedAmount, deliveryMethod) {
    const findResult = await readOneOperation(
        'products',
        {
            _id: orderedProduct._id,
        },
        { imageDetails: 0, imgSrc: 0 }
    );

    if (!findResult) {
        throw new ValidationError(`Wrong product id (${orderedProduct._id}) provided!`);
    }

    // Check if product is out of stock
    if (orderedAmount > findResult.stockAmount) {
        throw new ValidationError(
            `There is not enough stock for the product (${findResult._id}; ${findResult.title}) available.`
        );
    }

    // Check if product is inactive
    if (!findResult.active) {
        throw new ValidationError(
            `The product with the id ${findResult._id} is inactive and can therefore not be purchased.`
        );
    }

    // Check if the requested delivery method is available for the product
    if (!findResult[deliveryMethod]) {
        throw new ValidationError(
            `The requested delivery method ${deliveryMethod} is not available for the product with the id ${findResult._id}.`
        );
    }

    // Remove the stock Amount from the product, since we dont need it in the order
    delete findResult.stockAmount;

    return findResult;
}

/**
 * Creates an array which contains all the internal orders from the request in the order format
 * @param {object} orderObject
 * @param {object} orderData
 * @param {string} userEmail
 * @param {string} paypalOrderId
 * @returns
 */
async function createOrderArray(orderObject, orderData, userEmail, paypalOrderId) {
    // iterate over store ids, which are part of the order
    let orderArray = [];
    const storeIds = Object.keys(orderObject);

    for (let index = 0; index < storeIds.length; index++) {
        const storeId = storeIds[index];

        const productArray = orderObject[storeId].products;

        let grossItemTotal = 0;
        let itemTaxTotal = 0;
        // iterate over products to calculate the total sum and push the products to the order
        for (const element of productArray) {
            grossItemTotal = grossItemTotal + element.product.priceFloat * element.amount;
            itemTaxTotal =
                itemTaxTotal +
                parseFloat(
                    calculateProductTax(element.product.priceFloat, element.product.taxRate, element.product._id) *
                        parseInt(element.amount)
                );
        }

        // Shipping
        const grossShippingCosts = getShippingCostForSingleStore(orderObject[storeId].store, productArray);
        const shippingTaxAmount = calculateShippingTax(grossItemTotal, itemTaxTotal, grossShippingCosts);
        const netShippingCosts = grossShippingCosts - shippingTaxAmount;

        const taxTotal = itemTaxTotal + shippingTaxAmount;
        const netItemTotal = grossItemTotal - itemTaxTotal;

        // Fee
        const platformFeeRate = await getStorePlatformFeeRate(storeId);
        const platformFeeTotal = platformFeeRate * (grossItemTotal + grossShippingCosts);

        const transferTotal = grossItemTotal + grossShippingCosts - platformFeeTotal;
        const orderTotal = grossItemTotal + grossShippingCosts;

        const taxForTransferAmount = calculateTaxAccordingToRate(grossItemTotal, itemTaxTotal, platformFeeTotal);

        const valueBreakdown = {
            orderTotal: orderTotal.toFixed(2),
            netItemTotal: netItemTotal.toFixed(2),
            grossItemTotal: grossItemTotal.toFixed(2),
            netShippingCosts: netShippingCosts.toFixed(2),
            grossShippingCosts: grossShippingCosts.toFixed(2),
            taxTotal: taxTotal.toFixed(2),
            transferTotal: transferTotal.toFixed(2),
            platformFeeTotal: platformFeeTotal.toFixed(2),
            taxForTransferAmount: taxForTransferAmount.toFixed(2),
        };

        const orderOptions = {
            arrayIndex: index,
            storeId: storeId,
            userEmail: userEmail,
            datetimeCreated: new Date().toISOString(),
            datetimeAdjusted: '',
            deliveryMethod: orderData.deliveryMethod,
            valueBreakdown: valueBreakdown,
            products: productArray,
            currencyCode: orderData.currencyCode,
            billingAddress: orderData.billingAddress,
            shippingAddress: orderData.shippingAddress,
            paypalOrderId: paypalOrderId,
            paypalStatus: 'not-captured', // the paypal order has already been captured
            platformFeeRate: platformFeeRate,
        };
        const order = getOrderModel(orderOptions);

        orderArray.push(order);
    }

    if (!orderArray.length) {
        throw new Error('Order Array is empty, something went wrong.');
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
 * The function returns the platform fee rate for a store
 * @param {String} storeId the store id
 * @param {*} mongoDbSession the mongo db session
 * @throws when no platform fee rate was identified
 * @returns the platformFeeRate for the store when there is one. If not, the default value is returned
 */
async function getStorePlatformFeeRate(storeId, mongoDbSession) {
    const platformFee = await readOneOperation(databaseEntity.PLATFORM_FEES, { storeId: storeId }, {}, mongoDbSession);

    if (platformFee) {
        return platformFee.value;
    }

    if (!PLATFORM_FEE_RATE_DEFAULT) {
        throw new Error(`No platform fee could be identified for the store id ${storeId}.`);
    }

    return PLATFORM_FEE_RATE_DEFAULT;
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

/**
 * Calculates the tax rate amount for a specific product
 * @param {number} price the product price
 * @param {string} productTaxRate "normal" or "reduced"
 * @param {string} productId the product id
 * @returns
 */
function calculateProductTax(price, productTaxRate, productId) {
    let taxRate;
    if (productTaxRate === 'normal') {
        taxRate = 0.19;
    }

    if (productTaxRate === 'reduced') {
        taxRate = 0.07;
    }

    if (!productTaxRate) {
        throw new Error(`The product's (${productId}) tax rate is neither normal nor reduced.`);
    }

    const priceFloat = parseFloat(price);
    const productNetPrice = priceFloat / (1 + taxRate);
    const productTaxAmount = priceFloat - productNetPrice;

    return productTaxAmount;
}

/**
 *
 * @param {number} productGrossTotal
 * @param {number} productTaxTotal
 * @param {number} shippingCosts
 */
function calculateShippingTax(productGrossTotal, productTaxTotal, shippingCosts) {
    const taxRatio = productTaxTotal / productGrossTotal;
    const shippingCostTax = shippingCosts * taxRatio;

    return shippingCostTax;
}

/**
 *
 * @param {number} productGrossTotal
 * @param {number} productTaxTotal
 * @param {number} costsToCalcTax
 */
function calculateTaxAccordingToRate(productGrossTotal, productTaxTotal, costsToCalcTax) {
    const taxRatio = productTaxTotal / productGrossTotal;
    const taxAmount = costsToCalcTax * taxRatio;

    return taxAmount;
}
