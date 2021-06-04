'use strict';
import { deepObjectCopy } from '../../../src/utils/objectFunctions';

import {
    createProductService,
    editProductService,
    deleteProductService,
    updateStockAmountService,
    getProductImageService,
} from '../../../src/store-module/services/products.service';

import { sendNotificationsService } from '../../../src/store-module/services/product-avail-notif.service';
jest.mock(
    '../../../src/store-module/services/product-avail-notif.service',
    () => ({
        sendNotificationsService: jest.fn(),
    })
);

import { readOneOperation } from '../../../src/storage/database-operations/read-one-operation';
jest.mock(
    '../../../src/storage/database-operations/read-one-operation',
    () => ({
        readOneOperation: jest.fn(),
    })
);

import { deleteOneOperation } from '../../../src/storage/database-operations/delete-one-operation';
jest.mock(
    '../../../src/storage/database-operations/delete-one-operation',
    () => ({
        deleteOneOperation: jest.fn(),
    })
);

import { createOneOperation } from '../../../src/storage/database-operations/create-one-operation';
jest.mock(
    '../../../src/storage/database-operations/create-one-operation',
    () => ({
        createOneOperation: jest.fn(),
    })
);

import { updateOneOperation } from '../../../src/storage/database-operations/update-one-operation';
jest.mock(
    '../../../src/storage/database-operations/update-one-operation',
    () => ({
        updateOneOperation: jest.fn(),
    })
);

import { readManyOperation } from '../../../src/storage/database-operations/read-many-operation';
jest.mock(
    '../../../src/storage/database-operations/read-many-operation',
    () => ({
        readManyOperation: jest.fn(),
    })
);

import { updateOneAndReturnOperation } from '../../../src/storage/database-operations/update-one-and-return-operation';
jest.mock(
    '../../../src/storage/database-operations/update-one-and-return-operation',
    () => ({
        updateOneAndReturnOperation: jest.fn(),
    })
);

import { setActivationMinOneProduct } from '../../../src/store-module/services/activation.service';
jest.mock('../../../src/store-module/services/activation.service', () => ({
    setActivationMinOneProduct: jest.fn(),
}));

import { mockStore1 } from '../../mocks/data/mockStore';
import { mockUserCustomer1, mockUserOwner1 } from '../../mocks/data/mockUser';
import { mockProduct1 } from '../../mocks/data/mockProduct';

describe('products.service Tests', () => {
    const exampleProduct1 = deepObjectCopy(mockProduct1);
    let exampleStore;
    const exampleUserOwner1 = deepObjectCopy(mockUserOwner1);
    updateOneOperation.mockReturnValue('');

    beforeEach(() => {
        jest.resetAllMocks();
        exampleStore = deepObjectCopy(mockStore1);
    });

    it('addProduct Success', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(exampleStore)
            .mockReturnValueOnce(mockUserCustomer1);
        const resultExample = { ops: [exampleProduct1] };
        createOneOperation.mockReturnValueOnce(resultExample);
        setActivationMinOneProduct.mockReturnValueOnce('');

        const result = await createProductService(
            exampleProduct1,
            exampleUserOwner1.email,
            exampleStore._id
        );
        expect(result.title).toBe(exampleProduct1.title);
    });

    it('addProduct Should fail: Store id not found', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(mockUserCustomer1);

        await expect(
            createProductService(
                exampleProduct1,
                exampleUserOwner1.email,
                exampleStore._id
            )
        ).rejects.toThrow(`Store with the id ${exampleStore._id} not found.`);
    });

    it('addProduct Should fail: Unauthorized user', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(exampleStore)
            .mockReturnValueOnce(mockUserCustomer1);
        const anyOtherEmail = 'any.other.email@web.de';

        await expect(
            createProductService(
                exampleProduct1,
                anyOtherEmail,
                exampleStore._id
            )
        ).rejects.toThrow(
            `User with the email address ${anyOtherEmail} unauthorized to edit this store.`
        );
    });

    it('editProduct Success', async function () {
        const changedData = deepObjectCopy(exampleProduct1);
        changedData.title = 'Changed Title';
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation.mockReturnValueOnce(exampleStore);
        updateOneAndReturnOperation.mockReturnValueOnce(changedData);

        const result = await editProductService(
            changedData,
            exampleUserOwner1.email,
            exampleStore._id,
            exampleProduct1._id
        );
        expect(result.title).toBe(changedData.title);
    });

    it('editProduct Should fail: Store id not found', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(mockUserCustomer1);

        await expect(
            editProductService(
                exampleProduct1,
                exampleUserOwner1.email,
                exampleStore._id,
                exampleProduct1._id
            )
        ).rejects.toThrow(`Store with the id ${exampleStore._id} not found.`);
    });

    it('editProduct Should fail: Unauthorized user', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(exampleStore)
            .mockReturnValueOnce(mockUserCustomer1);
        const anyOtherEmail = 'any.other.email@web.de';

        await expect(
            editProductService(
                exampleProduct1,
                anyOtherEmail,
                exampleStore._id,
                exampleProduct1._id
            )
        ).rejects.toThrow(
            `User with the email address ${anyOtherEmail} unauthorized to edit this store.`
        );
    });

    it('deleteProduct Success', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation.mockReturnValueOnce(exampleStore);
        deleteOneOperation.mockReturnValueOnce('');
        setActivationMinOneProduct.mockReturnValueOnce('');
        readManyOperation.mockReturnValueOnce('');

        const result = await deleteProductService(
            exampleUserOwner1.email,
            exampleStore._id,
            exampleProduct1._id
        );
        expect(deleteOneOperation.mock.calls.length).toBe(1);
    });

    it('deleteProduct Should fail: Store id not found', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(mockUserCustomer1);

        await expect(
            deleteProductService(
                exampleUserOwner1.email,
                exampleStore._id,
                exampleProduct1._id
            )
        ).rejects.toThrow(`Store with the id ${exampleStore._id} not found.`);
    });

    it('deleteProduct Should fail: Unauthorized user', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(exampleStore)
            .mockReturnValueOnce(mockUserCustomer1);
        const anyOtherEmail = 'any.other.email@web.de';

        await expect(
            deleteProductService(
                anyOtherEmail,
                exampleStore._id,
                exampleProduct1._id
            )
        ).rejects.toThrow(
            `User with the email address ${anyOtherEmail} unauthorized to edit this store.`
        );
    });

    it('updateStockAmount Success', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation.mockReturnValueOnce(exampleStore);
        sendNotificationsService.mockReturnValueOnce('');
        updateOneAndReturnOperation.mockReturnValueOnce('');

        const data = { stockAmount: 2 };
        await updateStockAmountService(
            data,
            exampleUserOwner1.email,
            exampleStore._id,
            exampleProduct1._id
        );
        expect(updateOneAndReturnOperation.mock.calls.length).toBe(1);
    });

    it('updateStockAmount Should fail: Store id not found', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(mockUserCustomer1);
        const data = { stockAmount: 2 };
        await expect(
            updateStockAmountService(
                data,
                exampleUserOwner1.email,
                exampleStore._id,
                exampleProduct1._id
            )
        ).rejects.toThrow(`Store with the id ${exampleStore._id} not found.`);
    });

    it('updateStockAmount Should fail: Unauthorized user', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(exampleStore)
            .mockReturnValueOnce(mockUserCustomer1);
        const anyOtherEmail = 'any.other.email@web.de';
        const data = { stockAmount: 2 };
        await expect(
            updateStockAmountService(
                data,
                anyOtherEmail,
                exampleStore._id,
                exampleProduct1._id
            )
        ).rejects.toThrow(
            `User with the email address ${anyOtherEmail} unauthorized to edit this store.`
        );
    });

    it('getProductImage Success', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(exampleStore)
            .mockReturnValueOnce(exampleProduct1.imgSrc);
        const result = await getProductImageService(
            exampleStore._id,
            exampleProduct1._id
        );
        expect(result).toBe(exampleProduct1.imgSrc);
    });

    it('getProductImage Should fail: Store id not found', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation.mockReturnValueOnce(false);
        await expect(
            getProductImageService(exampleStore._id, exampleProduct1._id)
        ).rejects.toThrow(`Store with the id ${exampleStore._id} not found.`);
    });
});
