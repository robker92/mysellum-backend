'use strict';
import { deepObjectCopy } from '../../../src/utils/objectFunctions';
import {
    addReviewService,
    editReviewService,
    deleteReviewService,
} from '../../../src/store-module/services/reviews.service';

import { readOneOperation } from '../../../src/storage/database-operations/read-one-operation';
jest.mock(
    '../../../src/storage/database-operations/read-one-operation',
    () => ({
        readOneOperation: jest.fn(),
    })
);

import { updateOneOperation } from '../../../src/storage/database-operations/update-one-operation';
jest.mock(
    '../../../src/storage/database-operations/update-one-operation',
    () => ({
        updateOneOperation: jest.fn(),
    })
);

import { mockStore1 } from '../../mocks/data/mockStore';
import {
    mockUserCustomer1,
    mockUserCustomer2,
} from '../../mocks/data/mockUser';
import { mockReview1, mockReview2 } from '../../mocks/data/mockReview';

describe('reviews.service Tests', () => {
    const exampleReview1 = deepObjectCopy(mockReview1);
    const exampleReview2 = deepObjectCopy(mockReview2);
    let mockStore;
    const exampleUserCustomer1 = deepObjectCopy(mockUserCustomer1);

    beforeEach(() => {
        jest.resetAllMocks();
        mockStore = deepObjectCopy(mockStore1);
    });

    it('addReview Success', async function () {
        readOneOperation
            .mockReturnValueOnce(mockStore)
            .mockReturnValueOnce(exampleUserCustomer1)
            .mockReturnValueOnce(mockStore)
            .mockReturnValueOnce(mockUserCustomer2);

        const mockResult1 = {
            avgRating: '2.00',
            review: deepObjectCopy(exampleReview1),
        };

        const result = await addReviewService(
            exampleReview1, // only rating and text is used, and the result review is created which will be the input review
            mockStore._id,
            exampleUserCustomer1.email
        );

        expect(result.avgRating).toBe(mockResult1.avgRating);
        expect(result.review.rating).toBe(mockResult1.review.rating);
        expect(result.review.text).toBe(mockResult1.review.text);
        expect(result.review.userEmail).toBe(mockResult1.review.userEmail);
        expect(result.review.userFirstName).toBe(
            mockResult1.review.userFirstName
        );
        expect(result.review.userLastName).toBe(
            mockResult1.review.userLastName
        );

        // Add another review
        const result2 = await addReviewService(
            exampleReview2,
            mockStore._id,
            mockUserCustomer2.email
        );
        expect(result2.avgRating).toBe('3.50');
    });

    it('addReview Should fail: Store id not found', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(exampleUserCustomer1);

        await expect(
            addReviewService(
                exampleReview1,
                mockStore._id,
                exampleUserCustomer1.email
            )
        ).rejects.toThrow(`Store with the id ${mockStore._id} not found.`);
    });

    it('addReview Should fail: User already submitted review for this store', async function () {
        const testStore = deepObjectCopy(mockStore);
        testStore.profileData.reviews.push({
            userEmail: exampleUserCustomer1.email,
        });
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation.mockReturnValueOnce(testStore);

        await expect(
            addReviewService(
                exampleReview1,
                mockStore._id,
                exampleUserCustomer1.email
            )
        ).rejects.toThrow(
            `User with the email address ${exampleUserCustomer1.email} already submitted a review for the store with the id ${mockStore._id}.`
        );
    });

    it('addReview Should fail: User not found', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(mockStore)
            .mockReturnValueOnce(false);

        await expect(
            addReviewService(
                exampleReview1,
                mockStore._id,
                exampleUserCustomer1.email
            )
        ).rejects.toThrow(
            `User with the email address ${exampleUserCustomer1.email} not found.`
        );
    });

    it('editReview Success', async function () {
        // Create a test review like its added in the database to push to the testStore
        const testReview = deepObjectCopy(exampleReview1);

        // test Store
        const testStore = deepObjectCopy(mockStore);
        testStore.profileData.reviews.push(testReview);

        // Review change data
        const reviewChangeData = {
            rating: 3,
            text: 'Changed Text',
        };

        // Mocks
        readOneOperation
            .mockReturnValueOnce(testStore)
            .mockReturnValueOnce(exampleUserCustomer1);

        const result = await editReviewService(
            reviewChangeData,
            mockStore._id,
            '0',
            exampleUserCustomer1.email
        );

        expect(result.avgRating).toBe('3.00');
        expect(result.review.text).toBe('Changed Text');
    });

    it('editReview Should fail: Store id not found', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation.mockReturnValueOnce(false);

        await expect(
            editReviewService(
                exampleReview1,
                mockStore._id,
                '0',
                exampleUserCustomer1.email
            )
        ).rejects.toThrow(`Store with the id ${mockStore._id} not found.`);
    });

    it('editReview Should fail: Review not found', async function () {
        const testReview = deepObjectCopy(exampleReview1);
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation.mockReturnValueOnce(mockStore);

        await expect(
            editReviewService(
                testReview,
                mockStore._id,
                '0',
                exampleUserCustomer1.email
            )
        ).rejects.toThrow(`Review with the id ${'0'} not found.`);
    });

    it('editReview Should fail: User not authorized', async function () {
        const testReview = deepObjectCopy(exampleReview1);
        testReview.userEmail = 'othermail@web.de';

        // test Store
        const testStore = deepObjectCopy(mockStore);
        testStore.profileData.reviews.push(testReview);

        // We return an empty object at the first read operation (the store read operation)
        readOneOperation.mockReturnValueOnce(testStore);

        await expect(
            editReviewService(
                testReview,
                mockStore._id,
                '0',
                exampleUserCustomer1.email
            )
        ).rejects.toThrow(`The user is not authorized to edit this review.`);
    });

    it('deleteReview Success', async function () {
        // Create a test review like its added in the database to push to the testStore
        const testReview = deepObjectCopy(exampleReview1);

        // test Store
        const testStore = deepObjectCopy(mockStore);
        testStore.profileData.reviews.push(testReview);

        // Mocks
        readOneOperation.mockReturnValueOnce(testStore);

        const result = await deleteReviewService(
            mockStore._id,
            '0',
            exampleUserCustomer1.email
        );
        console.log(result);

        expect(result.reviewId).toBe('0');
        expect(result.avgRating).toBe('0.00');
    });

    it('deleteReview Should fail: Store id not found', async function () {
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(exampleUserCustomer1);

        await expect(
            deleteReviewService(mockStore._id, '0', exampleUserCustomer1.email)
        ).rejects.toThrow(`Store with the id ${mockStore._id} not found.`);
    });

    it('deleteReview Should fail: Review not found', async function () {
        const testReview = deepObjectCopy(exampleReview1);
        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(mockStore)
            .mockReturnValueOnce(false);

        await expect(
            deleteReviewService(mockStore._id, '0', exampleUserCustomer1.email)
        ).rejects.toThrow(`Review with the id ${'0'} not found.`);
    });

    it('deleteReview Should fail: User not authorized', async function () {
        const testReview = deepObjectCopy(exampleReview1);
        testReview.userEmail = 'othermail@web.de';

        // test Store
        const testStore = deepObjectCopy(mockStore);
        testStore.profileData.reviews.push(testReview);

        // We return an empty object at the first read operation (the store read operation)
        readOneOperation
            .mockReturnValueOnce(testStore)
            .mockReturnValueOnce(exampleUserCustomer1);

        await expect(
            deleteReviewService(mockStore._id, '0', exampleUserCustomer1.email)
        ).rejects.toThrow(`The user is not authorized to delete this review.`);
    });
});
