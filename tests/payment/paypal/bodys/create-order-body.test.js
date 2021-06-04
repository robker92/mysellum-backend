const rewire = require('rewire');
const createOrderBody = rewire(
    '../../../../src/payment/paypal/bodys/create-order-body.js'
);
const createItemArray = createOrderBody.__get__('createItemArray');

describe('Tests for the paypal create order body functions', () => {
    beforeAll(async function () {});
    afterAll(async function () {});

    it('createItemArray', async function () {
        const currencyCode = 'EUR';
        const testProduct1 = {};
        const testAmount1 = 5;
        const testProduct2 = {};
        const testAmount2 = 3;
        const productArray = [
            { product: testProduct1, amount: testAmount1 },
            { product: testProduct2, amount: testAmount2 },
        ];

        const resultItemArray = createItemArray(productArray, currencyCode);

        const expectedItemArray = [
            {
                name: testProduct1.title,
                description: testProduct1.description,
                unit_amount: {
                    currency_code: currencyCode,
                    value: testProduct1.price,
                },
                tax: {
                    currency_code: currencyCode,
                    value: productTax.toString(), //'5.00',
                },
                quantity: testAmount1,
            },
            {
                name: testProduct2.title,
                description: testProduct2.description,
                unit_amount: {
                    currency_code: currencyCode,
                    value: testProduct1.price,
                },
                tax: {
                    currency_code: currencyCode,
                    value: productTax.toString(), //'5.00',
                },
                quantity: testAmount2,
            },
        ];
        expect(resultItemArray).toEqual(expectedItemArray);
    });
});
