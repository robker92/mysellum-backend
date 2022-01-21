'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    createProductService,
    editProductService,
    deleteProductService,
    updateStockAmountService,
    getProductImageService,
    getStoreProductsService,
} from '../services/products.service';

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
    const stockAmount = req.body.stockAmount;

    try {
        await updateStockAmountService(stockAmount, userEmail, storeId, productId);
    } catch (error) {
        return next(error);
    }

    return res.sendStatus(StatusCodes.OK);
};

const getStoreProducts = async function (req, res, next) {
    const storeId = req.params.storeId;
    const userEmail = req.userEmail;
    const searchTerm = req.query.search;
    const priceMin = req.query.priceMin;
    const priceMax = req.query.priceMax;

    let products;
    try {
        products = await getStoreProductsService(userEmail, storeId, searchTerm, priceMin, priceMax);
    } catch (error) {
        return next(error);
    }

    return res.status(200).json({
        products: products,
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
