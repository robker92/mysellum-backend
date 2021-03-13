// https://developer.paypal.com/docs/checkout/reference/server-integration/set-up-transaction/
// https://developer.paypal.com/docs/platforms/checkout/configure-payments/multiseller-payments/

/**
 * Returns the complete payload for the create order post request
 * @param {Object} orderData
 * userEmail: this.user.email,
 * products: [],
 * shippingAddress: {},
 * totalSum: "",
 * currency: "EUR"
 */
export function getCreateOrderBody(orderData) {
    const currencyCode = orderData.currencyCode;
    const totalSum = orderData.totalSum;
    const products = orderData.products;
    const shippingAddress = orderData.shippingAddress;
    // return {
    //     intent: 'CAPTURE',
    //     purchase_units: [
    //         {
    //             amount: {
    //                 currency_code: amountCurrency, //'USD',
    //                 value: amountValue, //'100.00',
    //             },
    //             // payee: {
    //             //     email_address: payeeEmailAddress,
    //             // },
    //             payment_instruction: {
    //                 disbursement_mode: 'INSTANT',
    //                 platform_fees: [
    //                     {
    //                         amount: {
    //                             currency_code: platformFeesCurrency, //'USD',
    //                             value: platformFeesAmount, //'25.00',
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     ],
    // };
    const itemArray = getItemsFromCart(products, currencyCode);
    console.log(itemArray);
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
        purchase_units: [
            {
                reference_id: 'PUHF',
                // description: 'Sporting Goods',
                // custom_id: 'CUST-HighFashions',
                // soft_descriptor: 'HighFashions',
                // payee: {
                //     email_address: 'merchant@example.com',
                // },
                amount: {
                    currency_code: currencyCode,
                    value: totalSum,
                    breakdown: {
                        item_total: {
                            currency_code: currencyCode,
                            value: totalSum,
                        },
                        //     shipping: {
                        //         currency_code: 'EUR',
                        //         value: '30.00',
                        //     },
                        //     handling: {
                        //         currency_code: 'EUR',
                        //         value: '10.00',
                        //     },
                        //     tax_total: {
                        //         currency_code: 'EUR',
                        //         value: '20.00',
                        //     },
                        //     shipping_discount: {
                        //         currency_code: 'EUR',
                        //         value: '10',
                        //     },
                    },
                },
                items: itemArray,
                shipping: {
                    // method: 'United States Postal Service',
                    address: {
                        name: {
                            //TODO
                            full_name: shippingAddress.firstName,
                            surname: shippingAddress.lastName,
                        },
                        address_line_1: shippingAddress.addressLine1,
                        address_line_2: '',
                        admin_area_2: shippingAddress.city,
                        admin_area_1: '',
                        postal_code: shippingAddress.postcode,
                        country_code: 'DE',
                    },
                },
                payment_instruction: {
                    disbursement_mode: 'INSTANT',
                    platform_fees: [
                        {
                            amount: {
                                currency_code: 'EUR',
                                value: '2.00',
                            },
                        },
                    ],
                },
            },
        ],
    };
    return body;
}

/**
 * Creates the items array for the purchase unit part of the body
 * @param {Array} products Two Dim. Array: [[{ProductObject}, PurchasedAmount],[{ProductObject}, PurchasedAmount]]
 * @param {String} currencyCode String like USD, EUR
 */
function getItemsFromCart(products, currencyCode) {
    let items = [];
    for (const product of products) {
        const item = {
            name: product[0].title,
            description: product[0].description,
            unit_amount: {
                currency_code: currencyCode,
                value: product[0].price,
            },
            tax: {
                currency_code: currencyCode,
                value: '0.00', //'5.00',
            },
            quantity: product[1].toString(),
        };
        items.push(item);
    }
    return items;
}

function calculateAmountDetails(products, currencyCode) {
    const breakdownObject = {
        breakdown: {
            item_total: {
                currency_code: 'EUR',
                value: '',
            },
        },
    };

    if (shippingCosts) {
        breakdownObject.breakdown.shipping = {
            currency_code: 'EUR',
            value: shippingCosts,
        };
    }
    if (handlingCosts) {
        breakdownObject.breakdown.tax_total = {
            currency_code: 'EUR',
            value: taxTotal,
        };
    }
    breakdownObject.breakdown.handling = {
        currency_code: 'EUR',
        value: handlingCosts,
    };
    if (shippingDiscount) {
        breakdownObject.breakdown.shipping_discount = {
            currency_code: 'EUR',
            value: shippingDiscount,
        };
    }
    delete details.shipping_discount;
    return details;
}

function calculateProductTax() {}
