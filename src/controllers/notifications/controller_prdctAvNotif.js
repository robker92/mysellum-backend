"use strict";

import {
    ObjectId
} from 'mongodb';

import {
    sendNodemailerMail
} from '../../mailing/nodemailer';

import {
    getMongoPrdctNotifCollection,
    getMongoStoresCollection
} from '../../mongodb/collections';

const rgstrPrdctAvNotif = async function (req, res, next) {
    const collection = await getMongoPrdctNotifCollection();
    let email = req.body.email;
    let storeId = req.body.storeId;
    let productId = req.body.productId;
    let firstName = req.body.firstName || "";
    let lastName = req.body.lastName || "";

    //check if email already registered?

    let payload = {
        email: email,
        storeId: storeId,
        productId: productId
    };

    let result = await collection.insertOne(payload)
    //console.log(result)

    res.status(200).json({
        success: true,
        message: 'Product notification successfully registered!'
    });
};

const checkNotificationsEndpoint = async function (req, res, next) {
    let storeId = req.body.storeId;
    let productId = req.body.productId;

    let checkResult = await checkNotificationsFct(storeId, productId);

    res.status(200).json({
        success: true,
        result: checkResult
    });
};

async function checkNotificationsFct(storeId, productId) {
    const collection = await getMongoPrdctNotifCollection();
    let resultArray = [];

    let findResult = await collection.find({
        storeId: storeId,
        productId: productId
    }, {
        projection: {
            email: 1,
            _id: 0
        }
    }).toArray();

    for (let i = 0; i < findResult.length; i++) {
        resultArray.push(findResult[i].email)
    };
    console.log(resultArray)
    //return empty array if nothing is found
    // if (!findResult) {
    //     return [];
    // }
    return resultArray;
};

const sendNotificationsEndpoint = async function (req, res, next) {
    let storeId = req.body.storeId;
    let productId = req.body.productId;

    await sendNotifications(storeId, productId);

    res.status(200).send("Ok");
};

async function sendNotifications(storeId, productId) {
    const collectionStores = await getMongoStoresCollection();
    let emailArray = await checkNotificationsFct(storeId, productId);

    //if the array is empty, stop the function
    if (emailArray.length === 0) {
        console.log("No notifications registered!")
        return;
    }

    //Get the product
    let findResult = await collectionStores.findOne({
        "_id": ObjectId(storeId)
    });
    if (!findResult) {
        console.log("Store not found.")
        return;
    }
    let product;
    for (let i = 0; i < findResult.profileData.products.length; i++) {
        if (findResult.profileData.products[i].productId === productId) {
            product = findResult.profileData.products[i];
        };
    };

    //send the notification mails
    for (let i = 0; i < emailArray.length; i++) {
        let mailOptions = {
            email: emailArray[i],
            contentType: "prdctAvNotif",
            storeId: storeId,
            productId: productId,
            product: product
        };
        try {
            await sendNodemailerMail(mailOptions);
        } catch (error) {
            console.log(error)
            // return next({
            //     status: 401,
            //     type: "whileMailSending",
            //     message: "Error while sending!"
            // });
        };
    };

    deleteNotifications(storeId, productId);

    return;
};

async function deleteNotifications(storeId, productId) {
    const collection = await getMongoPrdctNotifCollection();

    collection.deleteMany({
        storeId: storeId,
        productId: productId
    });
    return;
};

//===================================================================================================
export { rgstrPrdctAvNotif, checkNotificationsEndpoint, checkNotificationsFct, sendNotificationsEndpoint, sendNotifications  };
//===================================================================================================