'use strict';
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

import { getReviewModel } from '../../data-models';

import { fetchAndValidateStore } from '../utils/operations/store-checks';

export { addReviewService, editReviewService, deleteReviewService };

/**
 *
 * @param {object} data
 * @param {string} storeId
 * @param {string} userEmail
 * @returns
 */
async function addReviewService(data, storeId, userEmail) {
    let findResult = await fetchAndValidateStore(storeId);
    // let findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }

    // Check if User already submitted a review for this specific store (only 1 review per store and per user allowed)
    if (
        findResult.profileData?.reviews?.findIndex(
            (rv) => rv.userEmail === userEmail
        ) !== -1
    ) {
        throw new Error(
            `User with the email address ${userEmail} already submitted a review for the store with the id ${storeId}.`
        );
    }

    //Define review id
    let reviewId;
    if (findResult.profileData.reviews.length === 0) {
        reviewId = 0;
        //avg = single rating
        findResult.profileData.avgRating = data.rating;
    } else {
        //add as first element
        reviewId = parseInt(findResult.profileData.reviews[0].reviewId) + 1;
    }

    //Get user first and last name
    const findResultUser = await readOneOperation(databaseEntity.USERS, {
        email: userEmail,
    });
    if (!findResultUser) {
        throw new Error(`User with the email address ${userEmail} not found.`);
    }

    const options = {
        reviewId: reviewId.toString(),
        userEmail: userEmail,
        userFirstName: findResultUser.firstName,
        userLastName: findResultUser.lastName,
        datetimeCreated: new Date().toISOString(),
        datetimeAdjusted: '',
        rating: data.rating,
        text: data.text,
    };
    const reviewData = getReviewModel(options);

    findResult.profileData.reviews.unshift(reviewData);
    findResult.profileData.avgRating = calculateAverage(
        findResult.profileData.reviews
    ).toString();

    await updateOneOperation(
        databaseEntity.STORES,
        {
            //Selection criteria
            _id: storeId,
        },
        findResult,
        'set'
    );

    return {
        review: findResult.profileData.reviews[0],
        avgRating: findResult.profileData.avgRating,
    };
}

function calculateAverage(array) {
    let value = 0.0;
    if (array.length > 0) {
        for (const element of array) {
            value = value + parseFloat(element.rating);
        }
        return (value / array.length).toFixed(2);
    } else {
        return '0.00';
    }
}

/**
 *
 * @param {object} data
 * @param {string} storeId
 * @param {string} reviewId
 * @param {string} userEmail
 * @returns
 */
async function editReviewService(data, storeId, reviewId, userEmail) {
    let findResult = await fetchAndValidateStore(storeId);
    // let findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }
    //var index = findResult.profileData.reviews.findIndex(rv => rv.userEmail === data.userEmail);
    const index = findResult.profileData?.reviews?.findIndex(
        (rv) => rv.reviewId === reviewId
    );
    if (index === -1) {
        throw new Error(`Review with the id ${reviewId} not found.`);
    }
    if (userEmail !== findResult.profileData.reviews[index].userEmail) {
        throw new Error(`The user is not authorized to edit this review.`);
    }

    findResult.profileData.reviews[index].text = data.text;
    findResult.profileData.reviews[index].rating = data.rating;
    findResult.profileData.reviews[index].datetimeAdjusted =
        new Date().toISOString();
    findResult.profileData.avgRating = calculateAverage(
        findResult.profileData.reviews
    ).toString();

    await updateOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        findResult,
        'set'
    );

    return {
        review: findResult.profileData.reviews[0],
        avgRating: findResult.profileData.avgRating,
    };
}

/**
 *
 * @param {string} storeId
 * @param {string} reviewId
 * @param {string} userEmail
 * @returns
 */
async function deleteReviewService(storeId, reviewId, userEmail) {
    let findResult = await fetchAndValidateStore(storeId);
    // let findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }
    //var index = findResult.profileData.reviews.findIndex(rv => rv.userEmail === data.userEmail);
    const index = findResult.profileData?.reviews?.findIndex(
        (rv) => rv.reviewId === reviewId
    );
    if (index === -1) {
        throw new Error(`Review with the id ${reviewId} not found.`);
    }
    if (userEmail !== findResult.profileData.reviews[index].userEmail) {
        throw new Error(`The user is not authorized to delete this review.`);
    }

    findResult.profileData?.reviews?.splice(index, 1);
    findResult.profileData.avgRating = calculateAverage(
        findResult.profileData.reviews
    ).toString();

    await updateOneOperation(
        databaseEntity.STORES,
        {
            _id: storeId,
        },
        findResult,
        'set'
    );

    return {
        reviewId: reviewId,
        avgRating: findResult.profileData.avgRating,
    };
}
