'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    getStoresReviewsService,
    addReviewService,
    editReviewService,
    deleteReviewService,
} from '../services/reviews.service';

export {
    getStoresReviewController,
    addReviewController,
    editReviewController,
    deleteReviewController,
};

const getStoresReviewController = async function (req, res, next) {
    const storeId = req.params.storeId;

    let reviews;
    try {
        reviews = await getStoresReviewsService(storeId);
    } catch (error) {
        return next(error);
    }

    return res.status(StatusCodes.OK).json(reviews);
};

const addReviewController = async function (req, res, next) {
    //TODO check if user bought a product at store
    const data = req.body;
    const storeId = req.params.storeId;
    const userEmail = req.userEmail;

    let result;
    try {
        result = await addReviewService(data, storeId, userEmail);
    } catch (error) {
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        avgRating: result.avgRating,
        review: result.review,
    });
};

const editReviewController = async function (req, res, next) {
    const data = req.body;
    const storeId = req.params.storeId;
    const reviewId = req.params.reviewId;
    const userEmail = req.userEmail;

    let result;
    try {
        result = await editReviewService(data, storeId, reviewId, userEmail);
    } catch (error) {
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        avgRating: result.avgRating,
        review: result.review,
    });
};

const deleteReviewController = async function (req, res, next) {
    const storeId = req.params.storeId;
    const reviewId = req.params.reviewId;
    const userEmail = req.userEmail;

    let result;
    try {
        result = await deleteReviewService(storeId, reviewId, userEmail);
    } catch (error) {
        return next(error);
    }

    return res.status(StatusCodes.OK).json({
        reviewId: reviewId,
        avgRating: result.avgRating,
    });
};
