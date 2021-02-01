import {
    ObjectId
} from 'mongodb';

import {
    getReviewModel
} from '../../data-models';

import {
    getMongoStoresCollection,
    getMongoUsersCollection
} from '../../mongodb/collections';

const addReview = async function (req, res, next) {
    //TODO check if user bought a product at store
    const collectionStores = await getMongoStoresCollection();
    const collectionUsers = await getMongoUsersCollection();
    let data = req.body;
    let storeId = req.params.storeId;
    console.log(req.userEmail)

    let findResult = await collectionStores.findOne({
        '_id': ObjectId(storeId)
    });

    if (!findResult) {
        return next({
            status: 400,
            message: "Wrong store id provided."
        });
    };
    //Check if User already submitted a review for this specific store (only 1 review per store and per user allowed)
    // if (findResult.profileData.reviews.findIndex(rv => rv.userEmail === req.userEmail)) {
    //     console.log("found")
    //     return next({
    //         status: 400,
    //         message: "User already submitted a review for this store."
    //     })
    // };

    //Define review id
    let reviewId;
    if (findResult.profileData.reviews.length === 0) {
        reviewId = 0;
        //avg = single rating
        findResult.profileData.avgRating = data.rating;
    } else {
        //add as first element
        reviewId = parseInt(findResult.profileData.reviews[0].reviewId) + 1;
    };

    //Get user first and last name
    let findResultUser = await collectionUsers.findOne({
        'email': req.userEmail
    });

    if (!findResultUser) {
        return next({
            status: 400,
            message: "User not found."
        });
    };

    let options = {
        "reviewId": reviewId.toString(),
        "userEmail": req.userEmail,
        "userFirstName": findResultUser.firstName,
        "userLastName": findResultUser.lastName,
        "userName": findResultUser.lastName + ", " + findResultUser.firstName,
        "datetimeCreated": new Date(),
        "datetimeAdjusted": "",
        "rating": data.rating,
        "text": data.text
    };
    let reviewData = getReviewModel(options);

    findResult.profileData.reviews.unshift(reviewData);
    findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();

    await collectionStores.updateOne({
        //Selection criteria
        '_id': ObjectId(storeId)
    }, {
        //Updated data
        $set: findResult
    });

    res.status(200).json({
        success: true,
        message: 'Successfully added review!',
        avgRating: findResult.profileData.avgRating,
        review: findResult.profileData.reviews[0]
    });
};

const editReview = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    let data = req.body;
    let storeId = req.params.storeId;
    let reviewId = req.params.reviewId;
    console.log(req.userEmail)

    let findResult = await collectionStores.findOne({
        '_id': ObjectId(storeId)
    });
    if (!findResult) {
        return next({
            status: 400,
            message: "Wrong store id provided."
        });
    };
    //var index = findResult.profileData.reviews.findIndex(rv => rv.userEmail === data.userEmail);
    let index = findResult.profileData.reviews.findIndex(rv => rv.reviewId === reviewId);
    //console.log(index)
    if (index === -1) {
        return next({
            status: 400,
            message: "Wrong review id provided."
        });
    };
    //TODO: check if correct user wants to edit
    findResult.profileData.reviews[index].text = data.text;
    findResult.profileData.reviews[index].rating = data.rating;
    findResult.profileData.reviews[index].datetimeAdjusted = new Date();
    findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    //console.log(findResult.profileData.reviews[index])
    await collectionStores.updateOne({
        //Selection criteria
        '_id': ObjectId(storeId)
    }, {
        //Updated data
        $set: findResult
    });
    //console.log(updateResult)

    res.status(200).json({
        success: true,
        message: 'Successfully edited review!',
        avgRating: findResult.profileData.avgRating,
        review: findResult.profileData.reviews[index]
    });
};

const deleteReview = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    let storeId = req.params.storeId;
    let reviewId = req.params.reviewId;
    let userEmail = req.userEmail;

    let updateResult = await collectionStores.updateOne({
        _id: ObjectId(storeId)
    }, {
        $pull: {
            'profileData.reviews': {
                reviewId: reviewId,
                userEmail: userEmail
            }
        }
    });

    if (!updateResult || !updateResult.result.nModified) {
        console.log("not updated")
        return next({
            status: 400,
            message: "Review not found or wrong user."
        });
    };
    //TODO: Transaction 
    //update average rating
    let findResult = await collectionStores.findOne({
        '_id': ObjectId(storeId)
    });
    findResult.profileData.avgRating = calculateAverage(findResult.profileData.reviews).toString();
    await collectionStores.updateOne({
        _id: ObjectId(storeId)
    }, {
        $set: findResult
    });

    res.status(200).json({
        success: true,
        message: 'Successfully deleted the review!',
        reviewId: reviewId,
        avgRating: findResult.profileData.avgRating
    });
};

function calculateAverage(array) {
    let value = 0.0;
    if (array.length > 0) {
        for (let i = 0; i < array.length; i++) {
            value = value + array[i].rating;
        }
        return (value / array.length).toFixed(2);
    } else {
        return 0;
    }
};

//===================================================================================================
export { addReview, editReview, deleteReview };
//===================================================================================================