// https://developer.paypal.com/docs/checkout/reference/server-integration/set-up-transaction/
// https://developer.paypal.com/docs/platforms/checkout/configure-payments/multiseller-payments/

import { createOrderDataStructure } from '../../internal/orders.service';
import { PAYPAL_REF_ID_HASH_NUM_BYTES } from '../../../config';
import crypto from 'crypto';

/**
 * Returns the complete payload for the create order post request
 * @param {Object} orderData
 */
export async function getCreateOrderBody(orderData) {
    // Get the order format { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }
    const orderObject = await createOrderDataStructure(orderData.products);
    const purchaseUnitArray = createPurchaseUnitArray(orderObject, orderData);
    console.log(purchaseUnitArray);

    // return {
    //     intent: 'CAPTURE',
    //     purchase_units: [
    //         {
    //             amount: {
    //                 currency_code: 'EUR',
    //                 value: '100.00',
    //             },
    //             // payee: {
    //             //     email_address: payeeEmailAddress,
    //             // },
    //             payment_instruction: {
    //                 disbursement_mode: 'INSTANT',
    //                 platform_fees: [
    //                     {
    //                         amount: {
    //                             currency_code: 'EUR',
    //                             value: '25.00',
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     ],
    // };

    const body = {
        intent: 'CAPTURE',
        application_context: {
            // return_url: 'https://example.com',
            // cancel_url: 'https://example.com',
            brand_name: 'Awesome Website INC',
            landing_page: 'BILLING',
            shipping_preference: 'SET_PROVIDED_ADDRESS',
            user_action: 'CONTINUE',
        },
        purchase_units: purchaseUnitArray,
    };
    console.log(JSON.stringify(body));
    return body;
}

/**
 * The function creates the purchase unit array. It will consist of one object for each store which is part of the order
 * @param {Object} orderObject the order object which was created from the cart
 * @param {Object} orderData
 */
function createPurchaseUnitArray(orderObject, orderData) {
    const purchaseUnitArray = [];
    const storeIds = Object.keys(orderObject);
    console.log(storeIds);
    for (const storeId of storeIds) {
        let productArray = orderObject[storeId].products;

        const hashRefId = crypto
            .randomBytes(PAYPAL_REF_ID_HASH_NUM_BYTES)
            .toString('hex');

        const amountObject = createAmount(productArray, orderData.currencyCode);
        const itemArray = createItemArray(productArray, orderData.currencyCode);
        const shippingObject = createShippingAddress(orderData.shippingAddress);
        const paymentInstructionObject = createPaymentInstruction(
            amountObject.value,
            orderData.currencyCode
        );
        // create purchase unit object
        const purchaseUnitObject = {
            reference_id: `${storeId}~${hashRefId}`,
            // description: 'Sporting Goods',
            // custom_id: 'CUST-HighFashions',
            // soft_descriptor: 'HighFashions',
            payee: {
                // email_address: 'sb-wqpm05264764@business.example.com',
                merchant_id: 'UW8X6XK7RGLP8',
            },
            amount: amountObject,
            items: itemArray,
            shipping: shippingObject,
            payment_instruction: paymentInstructionObject,
        };
        // console.log(purchaseUnitObject.amount.breakdown);
        console.log(purchaseUnitObject.items);
        // console.log(purchaseUnitObject.shipping.address);
        purchaseUnitArray.push(purchaseUnitObject);
    }
    return purchaseUnitArray;
}

/**
 * Creates the items array for the purchase unit part of the body
 * @param {Array} products Two Dim. Array: [[{ProductObject}, PurchasedAmount],[{ProductObject}, PurchasedAmount]]
 * @param {String} currencyCode String like USD, EUR
 */
// function createItemArray(products, currencyCode) {
//     let items = [];
//     for (const product of products) {
//         const item = {
//             name: product[0].title,
//             description: product[0].description,
//             unit_amount: {
//                 currency_code: currencyCode,
//                 value: product[0].price,
//             },
//             tax: {
//                 currency_code: currencyCode,
//                 value: '0.00', //'5.00',
//             },
//             quantity: product[1].toString(),
//         };
//         items.push(item);
//     }
//     return items;
// }

/**
 * Creates the items array for the purchase unit part of the body from the product object
 * @param {Array} productArray [{product: "", amount: ""}, {product: "", amount: ""}]
 * @param {String} currencyCode String like USD, EUR
 */
function createItemArray(productArray, currencyCode) {
    let items = [];
    for (const element of productArray) {
        const productTax = calculateProductTax(element.product.priceFloat);
        const productPrice = element.product.priceFloat - productTax;
        const item = {
            name: element.product.title,
            description: element.product.description,
            unit_amount: {
                currency_code: currencyCode,
                value: productPrice.toString(),
            },
            tax: {
                currency_code: currencyCode,
                value: productTax.toString(), //'5.00',
            },
            quantity: element.amount.toString(),
        };
        items.push(item);
    }
    return items;
}

function calculateProductTax(price) {
    // const taxRate = 0.19;
    const taxRate = 0.07;
    return (price * taxRate).toFixed(2); // current tax rate: 19%
}

/**
 * The function takes the order data from the frontend and creates the amount object as it is required for paypal
 * @param {Object} orderData the input orderData as it comes from the frontend
 */
function createAmount(productArray, currencyCode) {
    const breakdownValues = calculateBreakdown(productArray);
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
            //     shipping: {
            //         currency_code: 'EUR',
            //         value: '30.00',
            //     },
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
 */
function calculateBreakdown(productArray) {
    let itemTotal = 0;
    let taxTotal = 0;
    // iterate over products and calculate itemTotal and taxTotal
    for (const item of productArray) {
        taxTotal =
            taxTotal + parseFloat(calculateProductTax(item.product.priceFloat));
        itemTotal = itemTotal + item.product.priceFloat * parseInt(item.amount);
    }
    const totalSum = itemTotal.toFixed(2);
    // subtract the tax from the item total
    itemTotal = itemTotal - taxTotal;

    taxTotal = taxTotal.toFixed(2);
    itemTotal = itemTotal.toFixed(2);
    return { totalSum, itemTotal, taxTotal };
}

/**
 * The function takes the order data from the frontend and creates the payment instruction object as it is required for paypal
 * @param {Object} orderData the input orderData as it comes from the frontend
 */
function createPaymentInstruction(totalSum, currencyCode) {
    const platformFeeRate = 0.1;
    const platformFeeValue = (parseFloat(totalSum) * platformFeeRate).toFixed(
        2
    );
    return {
        disbursement_mode: 'INSTANT',
        platform_fees: [
            {
                amount: {
                    currency_code: currencyCode,
                    value: platformFeeValue,
                },
            },
        ],
    };
}

/**
 * The function takes the address input from the frontend and creates the shippingAddress object as it is required for paypal
 * @param {Object} shippingAddress the input shipping address as it comes from the frontend
 */
function createShippingAddress(shippingAddress) {
    return {
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
}

// function calculateAmountDetails(products, currencyCode) {
//     const breakdownObject = {
//         breakdown: {
//             item_total: {
//                 currency_code: 'EUR',
//                 value: '',
//             },
//         },
//     };

//     if (shippingCosts) {
//         breakdownObject.breakdown.shipping = {
//             currency_code: 'EUR',
//             value: shippingCosts,
//         };
//     }
//     if (handlingCosts) {
//         breakdownObject.breakdown.tax_total = {
//             currency_code: 'EUR',
//             value: taxTotal,
//         };
//     }
//     breakdownObject.breakdown.handling = {
//         currency_code: 'EUR',
//         value: handlingCosts,
//     };
//     if (shippingDiscount) {
//         breakdownObject.breakdown.shipping_discount = {
//             currency_code: 'EUR',
//             value: shippingDiscount,
//         };
//     }
//     delete details.shipping_discount;
//     return details;
// }
