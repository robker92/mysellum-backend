import { ObjectId } from 'mongodb';

import { getProductModel } from '../../data-models';

import { sendNotifications } from '../notifications/controller_prdctAvNotif';
import {
    getMongoStoresCollection,
    getMongoProductsCollection,
} from '../../mongodb/collections';

const createProduct = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    const collectionProducts = await getMongoProductsCollection();
    let data = req.body;
    let userEmail = req.userEmail;
    let storeId = req.params.storeId;

    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });

    if (!findResult) {
        return next({
            status: 400,
            message: 'Store not found.',
        });
    }
    //Guard to make sure that only the store owner is able to edit this store
    if (findResult.userEmail !== userEmail) {
        return next({
            status: 400,
            message: 'User unauthorized to edit this store.',
        });
    }
    let options = {
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
    };

    const product = getProductModel(options);

    let insertResult = await collectionProducts.insertOne(product);
    await setActivationMinOneProduct(storeId, true);

    res.status(200).json({
        success: true,
        message: 'Successfully added product!',
        product: insertResult.ops[0],
    });
};

async function setActivationMinOneProduct(storeId, value) {
    const collectionStores = await getMongoStoresCollection();

    await collectionStores.updateOne(
        {
            _id: ObjectId(storeId),
        },
        {
            $set: {
                'activationSteps.minOneProduct': value,
            },
        }
    );
    return;
}

const editProduct = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    const collectionProducts = await getMongoProductsCollection();
    let data = req.body;
    let storeId = req.params.storeId;
    let productId = req.params.productId;
    let userEmail = req.userEmail;

    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });

    if (!findResult) {
        return next({
            status: 400,
            message: 'Store not found.',
        });
    }
    //Guard to make sure that only the store owner is able to edit this store
    if (findResult.userEmail !== userEmail) {
        return next({
            status: 400,
            message: 'User unauthorized to edit this store.',
        });
    }

    let updateResult = await collectionProducts.findOneAndUpdate(
        {
            _id: ObjectId(productId),
            storeId: storeId,
        },
        {
            $set: {
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
            },
        },
        {
            returnOriginal: false,
            // projection: {
            //     imgSrc: 0
            // }
        }
        // {
        //     projection: {
        //         imgSrc: 0
        //     }
        // }
    );

    if (!updateResult || !updateResult.ok) {
        console.log('not updated');
        return next({
            status: 400,
            message:
                'Store not found or wrong ids provided. Product was not updated.',
        });
    }

    res.status(200).json({
        success: true,
        message: 'Product update successful!',
        product: updateResult.value,
    });
};

const deleteProduct = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    const collectionProducts = await getMongoProductsCollection();
    let storeId = req.params.storeId;
    let productId = req.params.productId;
    console.log(storeId);
    console.log(productId);
    let userEmail = req.userEmail;

    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });
    //Guard to make sure that only the store owner is able to edit this store
    if (findResult.userEmail !== userEmail) {
        return next({
            status: 400,
            message: 'User unauthorized to edit this store.',
        });
    }

    let deletionResult = await collectionProducts.deleteOne({
        _id: ObjectId(productId),
        storeId: storeId,
    });

    if (!deletionResult) {
        console.log('not updated');
        return next({
            status: 400,
            message: 'Store not deleted.',
        });
    }

    if (findResult.profileData.products.length === 1) {
        await setActivationMinOneProduct(storeId, false);
    }

    res.status(200).json({
        success: true,
        message: 'Successfully deleted the product!',
    });
};

const updateStockAmount = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    const collectionProducts = await getMongoProductsCollection();
    let storeId = req.params.storeId;
    let productId = req.params.productId;
    let userEmail = req.userEmail;
    let data = req.body;

    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });

    if (!findResult) {
        return next({
            status: 400,
            message: 'Store not found.',
        });
    }
    //Guard to make sure that only the store owner is able to edit this store
    if (findResult.userEmail !== userEmail) {
        return next({
            status: 400,
            message: 'User unauthorized to edit this store.',
        });
    }

    let updateResult = await collectionProducts.findOneAndUpdate(
        {
            _id: ObjectId(productId),
            storeId: storeId,
        },
        {
            $set: {
                stockAmount: parseInt(data.stockAmount),
            },
        }
    );

    if (!updateResult) {
        console.log('not updated');
        return next({
            status: 400,
            message: 'Store or product not found.',
        });
    }

    if (updateResult.value.stockAmount === 0) {
        console.log('trigger notification');
        sendNotifications(storeId, productId);
    }

    res.status(200).json({
        success: true,
        message: 'Product stock updated.',
    });
};

const getStoreProducts = async function (req, res, next) {
    const collectionProducts = await getMongoProductsCollection();
    let storeId = req.params.storeId;
    //TODO validate params
    let searchTerm = req.query.search;
    let priceMin = req.query.priceMin;
    let priceMax = req.query.priceMax;

    let findResult;
    if (searchTerm && !priceMin && !priceMax) {
        searchTerm = searchTerm.replace('-', ' ');

        findResult = await collectionProducts
            .find({
                $and: [
                    {
                        storeId: storeId,
                    },
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
                    {
                        storeId: storeId,
                    },
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
                    {
                        storeId: storeId,
                    },
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
            .find(
                {
                    storeId: storeId,
                }
                // {
                //     projection: {
                //         imgSrc: 0
                //     }
                // }
            )
            .sort({
                datetimeCreated: -1,
            })
            .toArray();
    }

    res.status(200).json({
        success: true,
        message: 'Successfully fetched products!',
        products: findResult,
    });
};

//Get the image of a product to display it in the shopping cart (because images are not stored in the cart anymore -> local storage size)
const getProductImage = async function (req, res, next) {
    let collectionStores = await getMongoStoresCollection();
    let collectionProducts = await getMongoProductsCollection();
    let storeId = req.params.storeId;
    let productId = req.params.productId;

    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });
    if (!findResult) {
        return next({
            status: 400,
            message: 'Store not found.',
        });
    }
    let findResultProduct = await collectionProducts.findOne({
        _id: ObjectId(productId),
    });
    //let index = findResult.profileData.products.findIndex(pr => pr.productId === productId);
    if (!findResultProduct) {
        return next({
            status: 400,
            message: 'Wrong product id provided.',
        });
    }
    let image = findResultProduct.imgSrc;
    //console.log(image.buffer)
    // let bytes = new Uint8Array(image.buffer);
    // let binary = bytes.reduce((data, b) => data += String.fromCharCode(b), '');

    //console.log(final)
    res.status(200).send(image);
};

//===================================================================================================
export {
    createProduct,
    editProduct,
    deleteProduct,
    updateStockAmount,
    getStoreProducts,
    getProductImage,
};
//===================================================================================================
