'use strict';

import {
    setActivationMinOneProduct,
    setActivationProfileComplete,
    setActivationShippingRegistered,
    setActivationPaymentMethodRegistered,
} from '../../../src/store-module/services/activation.service';

import { updateOneOperation } from '../../../src/storage/database-operations/update-one-operation';
jest.mock(
    '../../../src/storage/database-operations/update-one-operation',
    () => ({
        updateOneOperation: jest.fn(),
    })
);

describe('store-module activation.service Tests', () => {
    const mockStoreId = '1234';
    const mockValue = true;
    updateOneOperation.mockReturnValue('');

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('setActivationMinOneProduct should be called with right parameters', async function () {
        // We return an empty object at the first read operation (the store read operation)

        await setActivationMinOneProduct(mockStoreId, mockValue);

        expect(updateOneOperation.mock.calls.length).toBe(1);
        expect(updateOneOperation.mock.calls[0][0]).toBe('stores');
        expect(updateOneOperation.mock.calls[0][1]).toEqual({
            _id: mockStoreId,
        });
        expect(updateOneOperation.mock.calls[0][2]).toEqual({
            'activationSteps.minOneProduct': mockValue,
        });
        expect(updateOneOperation.mock.calls[0][3]).toBe('set');
    });

    it('setActivationProfileComplete should be called with right parameters', async function () {
        // We return an empty object at the first read operation (the store read operation)

        await setActivationProfileComplete(mockStoreId, mockValue);

        expect(updateOneOperation.mock.calls.length).toBe(1);
        expect(updateOneOperation.mock.calls[0][0]).toBe('stores');
        expect(updateOneOperation.mock.calls[0][1]).toEqual({
            _id: mockStoreId,
        });
        expect(updateOneOperation.mock.calls[0][2]).toEqual({
            'activationSteps.profileComplete': mockValue,
        });
        expect(updateOneOperation.mock.calls[0][3]).toBe('set');
    });

    it('setActivationShippingRegistered should be called with right parameters', async function () {
        // We return an empty object at the first read operation (the store read operation)

        await setActivationShippingRegistered(mockStoreId, mockValue);

        expect(updateOneOperation.mock.calls.length).toBe(1);
        expect(updateOneOperation.mock.calls[0][0]).toBe('stores');
        expect(updateOneOperation.mock.calls[0][1]).toEqual({
            _id: mockStoreId,
        });
        expect(updateOneOperation.mock.calls[0][2]).toEqual({
            'activationSteps.shippingRegistered': mockValue,
        });
        expect(updateOneOperation.mock.calls[0][3]).toBe('set');
    });

    it('setActivationPaymentMethodRegistered should be called with right parameters', async function () {
        // We return an empty object at the first read operation (the store read operation)

        await setActivationPaymentMethodRegistered(mockStoreId, mockValue);

        expect(updateOneOperation.mock.calls.length).toBe(1);
        expect(updateOneOperation.mock.calls[0][0]).toBe('stores');
        expect(updateOneOperation.mock.calls[0][1]).toEqual({
            _id: mockStoreId,
        });
        expect(updateOneOperation.mock.calls[0][2]).toEqual({
            'activationSteps.paymentMethodRegistered': mockValue,
        });
        expect(updateOneOperation.mock.calls[0][3]).toBe('set');
    });
});
