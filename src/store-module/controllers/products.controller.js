'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    createProductService,
    editProductService,
    deleteProductService,
    updateStockAmountService,
    getProductImageService,
} from '../services/products.service';
import { getMongoProductsCollection } from '../../storage/mongodb/collections';

export {
    createProductController,
    editProductController,
    deleteProductController,
    updateStockAmountController,
    getStoreProducts,
    getProductImageController,
};

const createProductController = async function (req, res, next) {
    let data = req.body;
    let userEmail = req.userEmail;
    let storeId = req.params.storeId;

    let product;
    try {
        product = await createProductService(data, userEmail, storeId);
    } catch (error) {
        return next(error);
    }

    return res.status(StatusCodes.CREATED).json({
        product: product,
    });
};

const editProductController = async function (req, res, next) {
    const data = req.body;
    const storeId = req.params.storeId;
    const productId = req.params.productId;
    const userEmail = req.userEmail;

    let product;
    try {
        product = await editProductService(data, userEmail, storeId, productId);
    } catch (error) {
        return next(error);
    }
    return res.status(StatusCodes.OK).json({
        product: product,
    });
};

const deleteProductController = async function (req, res, next) {
    const userEmail = req.userEmail;
    const storeId = req.params.storeId;
    const productId = req.params.productId;

    try {
        await deleteProductService(userEmail, storeId, productId);
    } catch (error) {
        return next(error);
    }
    return res.sendStatus(StatusCodes.OK);
};

const updateStockAmountController = async function (req, res, next) {
    const storeId = req.params.storeId;
    const productId = req.params.productId;
    const userEmail = req.userEmail;
    const data = req.body;

    try {
        await updateStockAmountService(data, userEmail, storeId, productId);
    } catch (error) {
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
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

    return res.status(200).json({
        success: true,
        message: 'Successfully fetched products!',
        products: findResult,
    });
};

//Get the image of a product to display it in the shopping cart (because images are not stored in the cart anymore -> local storage size)
const getProductImageController = async function (req, res, next) {
    const storeId = req.params.storeId;
    const productId = req.params.productId;

    let imageSrc;
    try {
        imageSrc = await getProductImageService(storeId, productId);
    } catch (error) {
        return next(error);
    }

    return res.status(StatusCodes.OK).send(imageSrc);
};
