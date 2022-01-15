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
import { getMongoProductsCollection } from '../../storage/mongodb/collections';

import { getProductModel } from '../../data-models';
import { storeActivationRoutine } from './activation.service';
import { sendNotificationsService } from './product-avail-notif.service';
import { setStoreDistributionValue, updateStoreDistributionValues } from './stores.service';

import { fetchAndValidateStore, validateStoreOwner } from '../utils/operations/store-checks';

import {
    uploadBlobService,
    deleteBlobService,
    getImageBufferResizedService,
    getImageBase64Resized,
} from './images.service';

// MongoDB transaction
import { getMongoDbClient, getMongoDbTransactionWriteOptions } from '../../storage/mongodb/setup';

export {
    createProductService,
    editProductService,
    deleteProductService,
    updateStockAmountService,
    getProductImageService,
    getStoreProductsService,
};

/**
 *
 * @param {object} data
 * @param {string} userEmail
 * @param {string} storeId
 * @returns the created product
 */
async function createProductService(data, userEmail, storeId) {
    // Resize file
    const resizedImage = await getImageBase64Resized(data.imgSrc);

    const file = {
        buffer: resizedImage.base64String,
        size: resizedImage.metadata.size,
        name: data.imageDetails.name,
    };
    const imageUrl = await uploadBlobService(file);
    console.log(imageUrl);
    console.log(`Active value: ${data.active}`);
    const options = {
        datetimeCreated: new Date().toISOString(),
        datetimeAdjusted: '',
        //"productId": productId.toString(),
        storeId: storeId,
        title: data.title,
        description: data.description,
        longDescription: data.longDescription,
        // image
        imgSrc: imageUrl,
        imageDetails: {
            size: resizedImage.metadata.size,
            originalname: file.name,
            name: file.name,
        },
        price: data.price,
        priceFloat: parseFloat(data.price),
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        quantityType: data.quantityType,
        quantityValue: data.quantityValue,
        delivery: data.delivery,
        pickup: data.pickup,
        active: data.active,
    };
    const product = getProductModel(options);

    let insertResult;
    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            const store = await fetchAndValidateStore(storeId, session);
            validateStoreOwner(userEmail, store.userEmail);

            insertResult = await createOneOperation(databaseEntity.PRODUCTS, product, session);

            await storeActivationRoutine(store, session);

            // set the store's distribution type when the value is true
            if (data.delivery === true) {
                await setStoreDistributionValue(storeId, 'delivery', true, session);
            }
            if (data.pickup === true) {
                await setStoreDistributionValue(storeId, 'pickup', true, session);
            }
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
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
    console.log(data.price);
    let product;

    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            const store = await fetchAndValidateStore(storeId, session);
            validateStoreOwner(userEmail, store.userEmail);

            const oldProduct = await readOneOperation(databaseEntity.PRODUCTS, {
                _id: productId,
                storeId: storeId,
            });

            let imageUrl;
            let imageDetails;
            if (oldProduct.imageDetails.name !== data.imageDetails.name) {
                // Resize file
                const resizedImage = await getImageBase64Resized(data.imgSrc);

                const file = {
                    buffer: resizedImage.base64String,
                    size: resizedImage.metadata.size,
                    name: data.imageDetails.name,
                };

                // Upload new image
                imageUrl = await uploadBlobService(file);
                console.log(imageUrl);

                // Delete old image
                const blobName = oldProduct.imgSrc.substring(
                    oldProduct.imgSrc.lastIndexOf('/') + 1,
                    oldProduct.imgSrc.length
                );
                console.log(`Old Image: ${blobName}`);
                try {
                    await deleteBlobService(blobName);
                } catch (error) {
                    // when an error occurs during deletion, the flow is not interrupted
                    console.log(`A blob could not be deleted. Message: ${error.message}`);
                }

                imageDetails = {
                    size: resizedImage.metadata.size,
                    originalname: file.name,
                    name: file.name,
                };
            } else {
                imageUrl = data.imgSrc;
                imageDetails = data.imageDetails;
            }

            product = await updateOneAndReturnOperation(
                databaseEntity.PRODUCTS,
                {
                    _id: productId,
                    storeId: storeId,
                },
                {
                    datetimeAdjusted: new Date().toISOString(),
                    title: data.title,
                    description: data.description,
                    longDescription: data.longDescription,
                    imgSrc: imageUrl,
                    imageDetails: imageDetails,
                    price: data.price,
                    priceFloat: parseFloat(data.price),
                    currency: data.currency,
                    currencySymbol: data.currencySymbol,
                    quantityType: data.quantityType,
                    quantityValue: data.quantityValue,
                    delivery: data.delivery,
                    pickup: data.pickup,
                    active: data.active,
                },
                'set',
                false,
                session
            );

            // set the store's distribution type when the value is true
            if (data.delivery === true) {
                await setStoreDistributionValue(storeId, 'delivery', true, session);
            }
            if (data.pickup === true) {
                await setStoreDistributionValue(storeId, 'pickup', true, session);
            }
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
    }

    console.log(product.price);
    return product;
}

/**
 *
 * @param {string} userEmail
 * @param {string} storeId
 * @param {string} productId
 */
async function deleteProductService(userEmail, storeId, productId) {
    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            const store = await fetchAndValidateStore(storeId, session);
            validateStoreOwner(userEmail, store.userEmail);

            const product = await readOneOperation(databaseEntity.PRODUCTS, {
                _id: productId,
                storeId: storeId,
            });

            // Delete old image
            const blobName = product.imgSrc.substring(product.imgSrc.lastIndexOf('/') + 1, product.imgSrc.length);
            console.log(`Old Image: ${blobName}`);
            // await deleteBlobService(blobName);

            try {
                await deleteBlobService(blobName);
            } catch (error) {
                // when an error occurs during deletion, the flow is not interrupted
                console.log(`A blob could not be deleted. Message: ${error.message}`);
            }

            // delete the product
            await deleteOneOperation(
                databaseEntity.PRODUCTS,
                {
                    _id: productId,
                    storeId: storeId,
                },
                session
            );

            // Trigger the store activation routine
            await storeActivationRoutine(store, session);
            // check the distribution values and update them
            await updateStoreDistributionValues(storeId, session);
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
    }

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
    const session = getMongoDbClient().startSession();
    try {
        await session.withTransaction(async () => {
            const store = await fetchAndValidateStore(storeId, session);
            validateStoreOwner(userEmail, store.userEmail);

            const product = await updateOneAndReturnOperation(
                databaseEntity.PRODUCTS,
                {
                    _id: productId,
                    storeId: storeId,
                },
                {
                    stockAmount: parseInt(data.stockAmount),
                },
                'set',
                session
            );

            if (product.stockAmount === 0) {
                console.log('trigger notification');
                sendNotificationsService(storeId, productId);
            }
        }, getMongoDbTransactionWriteOptions());
    } catch (error) {
        console.log('The transaction was aborted due to an unexpected error: ');
        console.log(error);
        throw error;
    } finally {
        await session.endSession();
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

    const imageSrc = await readOneOperation(
        databaseEntity.PRODUCTS,
        {
            _id: productId,
        },
        { imgSrc: 1, _id: 0 }
    );

    return imageSrc;
}

async function getStoreProductsService(userEmail, storeId, searchTerm, priceMin, priceMax) {
    const store = await fetchAndValidateStore(storeId);
    // let activeValue = true;
    let findObject = {
        storeId: storeId,
    };
    if (store.userEmail !== userEmail) {
        findObject.active = true;
    }
    console.log(`findObject: ${JSON.stringify(findObject)}`);

    let findResult;
    const collectionProducts = await getMongoProductsCollection();
    if (searchTerm && !priceMin && !priceMax) {
        searchTerm = searchTerm.replace('-', ' ');

        findResult = await collectionProducts
            .find({
                $and: [
                    findObject,
                    {
                        $text: {
                            $search: searchTerm,
                        },
                    },
                ],
            })
            .project({
                score: {
                    $meta: 'textScore',
                },
            })
            .sort({
                score: {
                    $meta: 'textScore',
                },
            })
            .toArray();
        //console.log("no search term provided.")
    } else if (priceMin && priceMax && !searchTerm) {
        console.log(priceMin);
        //return
        findResult = await collectionProducts
            .find({
                $and: [
                    findObject,
                    {
                        priceFloat: {
                            $gte: parseFloat(priceMin),
                            $lte: parseFloat(priceMax),
                        },
                    },
                ],
            })
            .sort({
                datetimeCreated: -1,
            })
            .toArray();
        //
    } else if (priceMin && priceMax && searchTerm) {
        //console.log(priceMin)
        findResult = await collectionProducts
            .find({
                $and: [
                    {
                        $text: {
                            $search: searchTerm,
                        },
                    },
                    findObject,
                    {
                        priceFloat: {
                            $gte: parseFloat(priceMin),
                            $lte: parseFloat(priceMax),
                        },
                    },
                ],
            })
            .project({
                score: {
                    $meta: 'textScore',
                },
            })
            .sort({
                score: {
                    $meta: 'textScore',
                },
            })
            .toArray();
    } else {
        findResult = await collectionProducts
            .find(findObject)
            .sort({
                datetimeCreated: -1,
            })
            .toArray();
    }

    return findResult;
}
