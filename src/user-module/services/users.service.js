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
//pg
import {
    seqReadOneOperation,
    seqReadManyOperation,
    seqUpdateOperation,
    seqCreateOperation,
    seqDeleteOneOperation,
    seqReadAndCountAllOperation,
    seqDatabaseEntity,
} from '../../storage/pg/operations';

export {
    getUserDataService,
    addStoreToFavoritesService,
    removeStoreFromFavoritesService,
};

async function getUserDataService(userEmail) {
    const user = await readOneOperation(
        seqDatabaseEntity.USER,
        {
            email: userEmail,
        },
        [
            // 'password',
            // 'shoppingCart',
            // 'ownedStoreId',
            // 'emailVerified',
            // 'verifyRegistrationToken',
            // 'verifyRegistrationExpires',
            // 'resetPasswordToken',
            // 'resetPasswordExpires',
            // 'deleted',
            // 'blocked',
            // 'storeId',
            // 'createdAt',
            // 'updatedAt',
            'firstName',
            'lastName',
            'addressLine1',
            'city',
            'postcode',
            'companyName',
        ]
    );
    // const user = await readOneOperation(
    //     databaseEntity.USERS,
    //     {
    //         email: userEmail,
    //     },
    //     {
    //         password: 0,
    //         shoppingCart: 0,
    //         datetimeCreated: 0,
    //         datetimeAdjusted: 0,
    //         ownedStoreId: 0,
    //         emailVerified: 0,
    //         verifyRegistrationToken: 0,
    //         verifyRegistrationExpires: 0,
    //         resetPasswordExpires: 0,
    //         resetPasswordToken: 0,
    //         deleted: 0,
    //         blocked: 0,
    //     }
    // );
    if (!user) {
        throw new Error(`A user with the email "${userEmail}" was not found.`);
    }
    console.log(user);
    return user;
}

async function addStoreToFavoritesService(userEmail, storeId) {
    await fetchAndValidateStore(storeId);
    // TODO
    const result = await readOneOperation(
        databaseEntity.USERS,
        { email: userEmail },
        { favoriteStores: 1 }
    );
    if (result.favoriteStores.length >= 20) {
        throw new Error(
            `The store with the id ${storeId} can not be added to favorites, because this operation would exceed the max number of favorite stores of 20.`
        );
    }
    if (result.favoriteStores.includes(storeId)) {
        throw new Error(
            `The store with the id ${storeId} is already in the favorites.`
        );
    }
    await updateOneOperation(
        databaseEntity.USERS,
        { email: userEmail },
        { favoriteStores: storeId },
        'push'
    );

    return;
}

async function removeStoreFromFavoritesService(userEmail, storeId) {
    await fetchAndValidateStore(storeId);

    const result = await readOneOperation(
        databaseEntity.USERS,
        { email: userEmail },
        { favoriteStores: 1 }
    );

    if (!result.favoriteStores.includes(storeId)) {
        throw new Error(
            `The store with the id ${storeId} is not in the favorites.`
        );
    }

    await updateOneOperation(
        databaseEntity.USERS,
        { email: userEmail },
        { favoriteStores: storeId },
        'pull'
    );

    return;
}

/**
 * Fetches a store by its storeId and returns it. Throws an error if the store was not found.
 * @param {string} storeId
 */
async function fetchAndValidateStore(storeId) {
    const findResult = await readOneOperation(databaseEntity.STORES, {
        _id: storeId,
    });
    if (!findResult) {
        throw new Error(`Store with the id ${storeId} not found.`);
    }
    return findResult;
}
