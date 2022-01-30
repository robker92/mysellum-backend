// https://developer.paypal.com/docs/checkout/reference/server-integration/set-up-transaction/
// https://developer.paypal.com/docs/platforms/checkout/configure-payments/multiseller-payments/
// https://developer.paypal.com/docs/checkout/reference/customize-sdk/

import { PAYPAL_PLATFORM_MERCHANT_ID, PAYPAL_PLATFORM_EMAIL, PLATFORM_FEE_RATE_DEFAULT } from '../../config';
import { readOneOperation, databaseEntity } from '../../storage/database-operations';
import {
    getShippingCostsService,
    calculateShippingCosts,
    getShippingCostForSingleStore,
} from '../../store-module/services/shipping.service';
import { hasValidProperty } from '../../utils/objectFunctions';
import { getStorePlatformFeeRate, calculateProductTax, calculateShippingTax } from '../utils/order-utils';

/**
 * Returns the complete payload for the create order post request
 * @param {Object} orderObject order object which was just created (Get the order format { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] })
 * @param {String} currencyCode
 * @param {Object} shippingAddress
 */
export async function getCreatePaypalOrderBody(orderObject, currencyCode, shippingAddress) {
    const purchaseUnitArray = await createPurchaseUnitArray(orderObject, currencyCode, shippingAddress);

    const body = {
        intent: 'CAPTURE',
        application_context: {
            // return_url: 'https://example.com',
            // cancel_url: 'https://example.com',
            brand_name: 'MySellum',
            landing_page: 'BILLING',
            shipping_preference: 'SET_PROVIDED_ADDRESS',
            user_action: 'CONTINUE',
        },
        purchase_units: purchaseUnitArray,
    };
    // console.log(JSON.stringify(body));
    return body;
}

/**
 * The function creates the purchase unit array. It will consist of one object for each store which is part of the order
 * @param {Object} orderObject order object which was just created
 * @param {String} currencyCode
 * @param {Object} shippingAddress
 */
async function createPurchaseUnitArray(orderObject, currencyCode, shippingAddress) {
    const purchaseUnitArray = [];
    const storeIds = Object.keys(orderObject);

    for (let i = 0; i < storeIds.length; i++) {
        const orderElement = orderObject[storeIds[i]];
        const productArray = orderElement.products;

        // TODO product tax rates

        const amountObject = createAmount(productArray, currencyCode, orderElement.store);
        const itemArray = createItemArray(productArray, currencyCode);
        const shippingObject = createShippingAddress(shippingAddress);
        const paymentInstructionObject = await createPaymentInstruction(
            amountObject.value,
            currencyCode,
            orderElement.store._id
        );
        // create purchase unit object
        const purchaseUnitObject = {
            reference_id: `${storeIds[i]}~${i}`,
            // description: 'Sporting Goods',
            // custom_id: 'CUST-HighFashions',
            // soft_descriptor: 'HighFashions',
            payee: {
                // email_address: orderElement.store.merchantEmailInPayPal,
                merchant_id: orderElement.store.merchantIdInPayPal,
            },
            amount: amountObject,
            items: itemArray,
            shipping: shippingObject,
            payment_instruction: paymentInstructionObject,
        };

        purchaseUnitArray.push(purchaseUnitObject);
    }

    return purchaseUnitArray;
}

/**
 * Creates the items array for the purchase unit part of the body from the product object
 * @param {Array} productArray [{product: "", amount: 1}, {product: "", amount: 1}]
 * @param {String} currencyCode String like USD, EUR
 */
function createItemArray(productArray, currencyCode) {
    // Check the input array
    if (!Array.isArray(productArray)) {
        throw new Error('The productArray has to be an array.');
    }

    let items = [];
    for (const element of productArray) {
        const productTaxAmount = calculateProductTax(
            element.product.priceFloat,
            element.product.taxRate,
            element.product._id
        );

        const productNetPrice = element.product.priceFloat - productTaxAmount;

        const item = {
            name: element.product.title,
            description: element.product.description,
            unit_amount: {
                currency_code: currencyCode,
                value: productNetPrice.toFixed(2),
            },
            tax: {
                currency_code: currencyCode,
                value: productTaxAmount.toFixed(2), //'5.00',
            },
            quantity: element.amount.toString(),
        };
        items.push(item);
    }

    return items;
}

/**
 * The function takes the order data from the frontend and creates the amount object as it is required for paypal
 */
function createAmount(productArray, currencyCode, store) {
    // Check the input array
    if (!Array.isArray(productArray)) {
        throw new Error('The productArray has to be an array.');
    }

    const breakdownValues = calculateBreakdown(productArray, store);
    const amount = {
        currency_code: currencyCode,
        value: breakdownValues.totalSum,
        // If you specify amount.breakdown, the amount equals
        // item_total plus tax_total plus shipping plus handling plus insurance minus shipping_discount minus discount.
        breakdown: {
            item_total: {
                currency_code: currencyCode,
                value: breakdownValues.itemTotal,
            },
            shipping: {
                currency_code: currencyCode,
                value: breakdownValues.shippingCosts,
            },
            //     handling: {
            //         currency_code: 'EUR',
            //         value: '10.00',
            //     },
            tax_total: {
                currency_code: currencyCode,
                value: breakdownValues.taxTotal,
            },
            //     shipping_discount: {
            //         currency_code: 'EUR',
            //         value: '10',
            //     },
        },
    };

    console.log(amount);
    return amount;
}

/**
 * The function calculates the values for the breakdown object
 * @param {Array} productArray
 * @param {Object} store
 * @return {{totalSum: string; itemTotal: string; taxTotal: string; shippingCosts: string; }}
 */
function calculateBreakdown(productArray, store) {
    // Check the input array
    if (!Array.isArray(productArray)) {
        throw new Error('The productArray has to be an array.');
    }

    let grossItemTotal = 0;
    let taxTotal = 0;
    // iterate over products and calculate itemTotal and taxTotal
    for (const item of productArray) {
        taxTotal =
            taxTotal +
            parseFloat(
                calculateProductTax(item.product.priceFloat, item.product.taxRate, item.product._id) *
                    parseInt(item.amount)
            );
        grossItemTotal = grossItemTotal + item.product.priceFloat * parseInt(item.amount);
    }

    const netItemTotal = (grossItemTotal - taxTotal).toFixed(2);

    // Shipping
    const grossShippingCosts = getShippingCostForSingleStore(store, productArray);
    // That is currently not needed, because calculating the shipping tax does not work with paypal
    /*
    const shippingCostTaxAmount = calculateShippingTax(grossItemTotal, taxTotal, grossShippingCosts);
    const netShippingCosts = (grossShippingCosts - shippingCostTaxAmount).toFixed(2);
    taxTotal = (taxTotal + shippingCostTaxAmount).toFixed(2);
    */

    const totalSum = (grossItemTotal + grossShippingCosts).toFixed(2);
    taxTotal = taxTotal.toFixed(2);

    return { totalSum: totalSum, itemTotal: netItemTotal, taxTotal: taxTotal, shippingCosts: grossShippingCosts };
}

/**
 * The function takes the order data from the frontend and creates the payment instruction object as it is required for paypal
 * @param {string | number} totalSum the total sum of the payment
 * @param {string} currencyCode the currency as string code
 * @param {string} storeId
 */
async function createPaymentInstruction(totalSum, currencyCode, storeId) {
    const floatTotalSum = parseFloat(totalSum);
    if (floatTotalSum < 0) {
        throw new Error('A negative total sum is not supported.');
    }

    const platformFeeRate = await getStorePlatformFeeRate(storeId);

    // const platformFeeRate = 0.1;
    const platformFeeValue = (floatTotalSum * platformFeeRate).toFixed(2);
    console.log(`Fee value: ${platformFeeValue}`);

    const paymentInstructionObject = {
        disbursement_mode: 'INSTANT',
        platform_fees: [
            {
                amount: {
                    currency_code: currencyCode,
                    value: platformFeeValue,
                },
                payee: {
                    merchant_id: PAYPAL_PLATFORM_MERCHANT_ID,
                    email_address: PAYPAL_PLATFORM_EMAIL,
                },
            },
        ],
    };

    return paymentInstructionObject;
}

/**
 * The function takes the address input from the frontend and creates the shippingAddress object as it is required for paypal
 * @param {Object} shippingAddress the input shipping address as it comes from the frontend
 */
function createShippingAddress(shippingAddress) {
    // Property validations
    if (!hasValidProperty(shippingAddress, 'firstName')) {
        throw new Error('No firstName was provided with the shipping address.');
    }
    if (!hasValidProperty(shippingAddress, 'lastName')) {
        throw new Error('No lastName was provided with the shipping address.');
    }
    if (!hasValidProperty(shippingAddress, 'addressLine1')) {
        throw new Error('No addressLine1 was provided with the shipping address.');
    }
    if (!hasValidProperty(shippingAddress, 'city')) {
        throw new Error('No city was provided with the shipping address.');
    }
    if (!hasValidProperty(shippingAddress, 'postcode')) {
        throw new Error('No postcode was provided with the shipping address.');
    }

    const shippingAddressObject = {
        // method: 'United States Postal Service',
        name: {
            full_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        },
        address: {
            address_line_1: shippingAddress.addressLine1,
            address_line_2: '', // For example, suite or apartment number.
            admin_area_2: shippingAddress.city, // Citys
            admin_area_1: '', // in Germany: states
            postal_code: shippingAddress.postcode,
            country_code: 'DE',
        },
    };

    return shippingAddressObject;
}
