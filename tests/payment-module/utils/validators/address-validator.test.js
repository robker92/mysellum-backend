import { validateOrderAddress } from '../../../../src/payment-module/utils/validators/address-validator';

describe('Tests for the function which check if a user is of age (>18)', () => {
    const mockAddress = {
        firstName: 'test1',
        lastName: 'test2',
        addressLine1: 'Vollmannstraße 10',
        city: 'München',
        postcode: '81927',
        country: 'Deutschland',
    };

    const mockAddress2 = {
        firstName: 'test1',
        lastName: 'test2',
        addressLine1: 'Stauffacherstrasse 141',
        city: 'Zürich',
        postcode: '8004',
        country: 'Schweiz',
    };
    it('Success', async function () {
        await validateOrderAddress(mockAddress);

        expect(1).toBe(1);
    });

    it('Success', async function () {
        await validateOrderAddress(mockAddress2);

        expect(1).toBe(1);
    });
});
