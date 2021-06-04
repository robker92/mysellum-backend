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

import { getProductModel } from '../../data-models';
import { setActivationMinOneProduct } from './activation.service';
import { sendNotificationsService } from './product-avail-notif.service';
import {
    setStoreDistribtuionValue,
    updateStoreDistribtuionValues,
} from './stores.service';

import {
    fetchAndValidateStore,
    validateStoreOwner,
} from '../utils/operations/store-checks';

export {
    createProductService,
    editProductService,
    deleteProductService,
    updateStockAmountService,
    getProductImageService,
};

/**
 *
 * @param {object} data
 * @param {string} userEmail
 * @param {string} storeId
 * @returns the created product
 */
async function createProductService(data, userEmail, storeId) {
    const store = await fetchAndValidateStore(storeId);
    validateStoreOwner(userEmail, store.userEmail);
    // const findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }
    //Guard to make sure that only the store owner is able to edit this store
    // if (findResult.userEmail !== userEmail) {
    //     throw new Error(
    //         `User with the email address ${userEmail} unauthorized to edit this store.`
    //     );
    // }

    const options = {
        datetimeCreated: new Date().toISOString(),
        datetimeAdjusted: '',
        //"productId": productId.toString(),
        storeId: storeId,
        title: data.title,
        description: data.description,
        imgSrc: data.imgSrc,
        imageDetails: data.imageDetails,
        price: data.price,
        //"priceFloat": parseFloat(data.price),
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        quantityType: data.quantityType,
        quantityValue: data.quantityValue,
        delivery: data.delivery,
        pickup: data.pickup,
    };
    const product = getProductModel(options);

    const insertResult = await createOneOperation(
        databaseEntity.PRODUCTS,
        product
    );
    // TODO Transaction
    await setActivationMinOneProduct(storeId, true);

    // set the store's distribution type when the value is true
    if (data.delivery === true) {
        await setStoreDistribtuionValue(storeId, 'delivery', true);
    }
    if (data.pickup === true) {
        await setStoreDistribtuionValue(storeId, 'pickup', true);
    }

    return insertResult.ops[0];
}

/**
 *
 * @param {object} data
 * @param {string} userEmail
 * @param {string} storeId
 * @param {string} productId
 * @returns nothing. Throws errors when something goes wrong
 */
async function editProductService(data, userEmail, storeId, productId) {
    const store = await fetchAndValidateStore(storeId);
    validateStoreOwner(userEmail, store.userEmail);
    // Validate the provided store id
    // const findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }
    // //Guard to make sure that only the store owner is able to edit this store
    // if (findResult.userEmail !== userEmail) {
    //     throw new Error(
    //         `User with the email address ${userEmail} unauthorized to edit this store.`
    //     );
    // }

    const product = await updateOneAndReturnOperation(
        databaseEntity.PRODUCTS,
        {
            _id: productId,
            storeId: storeId,
        },
        {
            datetimeAdjusted: new Date().toISOString(),
            title: data.title,
            description: data.description,
            imgSrc: data.imgSrc,
            imageDetails: data.imageDetails,
            price: data.price,
            priceFloat: parseFloat(data.price),
            currency: data.currency,
            currencySymbol: data.currencySymbol,
            quantityType: data.quantityType,
            quantityValue: data.quantityValue,
            delivery: data.delivery,
            pickup: data.pickup,
        },
        'set'
    );

    // TODO Transaction
    // set the store's distribution type when the value is true
    if (data.delivery === true) {
        await setStoreDistribtuionValue(storeId, 'delivery', true);
    }
    if (data.pickup === true) {
        await setStoreDistribtuionValue(storeId, 'pickup', true);
    }

    return product;
}

/**
 *
 * @param {string} userEmail
 * @param {string} storeId
 * @param {string} productId
 */
async function deleteProductService(userEmail, storeId, productId) {
    const store = await fetchAndValidateStore(storeId);
    validateStoreOwner(userEmail, store.userEmail);
    // Validate the provided store id
    // const findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }
    // //Guard to make sure that only the store owner is able to edit this store
    // if (findResult.userEmail !== userEmail) {
    //     throw new Error(
    //         `User with the email address ${userEmail} unauthorized to edit this store.`
    //     );
    // }

    // TODO Transaction
    // delete the product
    await deleteOneOperation(databaseEntity.PRODUCTS, {
        _id: productId,
        storeId: storeId,
    });

    const products = await readManyOperation(databaseEntity.PRODUCTS, {
        storeId: storeId,
    });
    if (products.length === 0) {
        await setActivationMinOneProduct(storeId, false);
    }

    // check the distribution values and update them
    await updateStoreDistribtuionValues(storeId);

    return;
}

/**
 *
 * @param {object} data
 * @param {string} userEmail
 * @param {string} storeId
 * @param {string} productId
 * @returns
 */
async function updateStockAmountService(data, userEmail, storeId, productId) {
    const store = await fetchAndValidateStore(storeId);
    validateStoreOwner(userEmail, store.userEmail);
    // Validate the provided store id
    // const findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }
    // //Guard to make sure that only the store owner is able to edit this store
    // if (findResult.userEmail !== userEmail) {
    //     throw new Error(
    //         `User with the email address ${userEmail} unauthorized to edit this store.`
    //     );
    // }

    const product = await updateOneAndReturnOperation(
        databaseEntity.PRODUCTS,
        {
            _id: productId,
            storeId: storeId,
        },
        {
            stockAmount: parseInt(data.stockAmount),
        },
        'set'
    );

    if (product.stockAmount === 0) {
        console.log('trigger notification');
        sendNotificationsService(storeId, productId);
    }

    return;
}

/**
 *
 * @param {string} storeId
 * @param {string} productId
 * @returns the source of the image or throws an error
 */
async function getProductImageService(storeId, productId) {
    await fetchAndValidateStore(storeId);
    // Validate the provided store id
    // const findResult = await readOneOperation(databaseEntity.STORES, {
    //     _id: storeId,
    // });
    // if (!findResult) {
    //     throw new Error(`Store with the id ${storeId} not found.`);
    // }

    const imageSrc = await readOneOperation(
        databaseEntity.PRODUCTS,
        {
            _id: productId,
        },
        { imgSrc: 1, _id: 0 }
    );

    return imageSrc;
}
