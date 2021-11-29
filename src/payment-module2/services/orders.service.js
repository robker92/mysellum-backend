'use strict';
import { ObjectId } from 'mongodb';
// database operations
import {
    readOneOperation,
    readManyOperation,
    updateOneOperation,
    createOneOperation,
    updateOneAndReturnOperation,
    databaseEntity,
} from '../../storage/database-operations';
import { sendNodemailerMail, contentType } from '../../mailing/nodemailer';
import { getMongoOrdersCollection } from '../../storage/mongodb/collections';

export {
    getSingleOrderService,
    getStoresOrdersService,
    getUsersOrdersService,
    getAllOrdersService,
    setStepStatusService,
    searchOrderByTermService,
};

// TODO jsDoc, transactions

async function getSingleOrderService(id) {
    const order = await readOneOperation(databaseEntity.ORDERS, { _id: id });

    if (!order) {
        throw new Error(`The order with the id "${order}" could not be found.`);
    }
    return order;
}

async function getStoresOrdersService(userEmail, pageSize, pageNum) {
    const collectionOrders = await getMongoOrdersCollection();

    const store = await readOneOperation(databaseEntity.STORES, {
        userEmail: userEmail,
    });
    if (!store) {
        throw new Error(
            `The store with the userEmail ${userEmail} could no be found.`
        );
    }

    // Add filters, sort etc
    let queryArray = [];
    queryArray.push({ storeId: ObjectId(store._id).toString() });
    const query =
        queryArray.length > 0
            ? {
                  $and: queryArray,
              }
            : {};
    console.log(query);
    console.log(queryArray[0]);
    const projectObject = {};
    const sortObject = { datetimeCreated: -1 };

    let resultCursor = await collectionOrders
        .find(queryArray[0])
        .project(projectObject)
        .sort(sortObject);
    const totalCount = await resultCursor.count();
    console.log(totalCount);

    pageSize = parseInt(pageSize);
    pageNum = parseInt(pageNum);
    const skips = pageSize * (pageNum - 1);

    const resultOrders = await resultCursor
        .skip(skips)
        .limit(pageSize)
        .toArray();

    return { orders: resultOrders, totalCount };
}

async function getUsersOrdersService(userEmail) {
    const orders = await readManyOperation(
        databaseEntity.ORDERS,
        {
            'user.email': userEmail,
        },
        {},
        { datetimeCreated: 1 }
    );

    return orders;
}

async function getAllOrdersService() {
    const orders = await readManyOperation(databaseEntity.ORDERS);

    return orders;
}

async function setStepStatusService(
    userEmail,
    storeId,
    orderId,
    step,
    value,
    type = ''
) {
    // Fetch store and validate store owner
    const store = await readOneOperation(databaseEntity.STORES, {
        _id: storeId,
    });
    if (!store) {
        throw new Error(`The store with the id ${storeId} could not be found.`);
    }
    //Guard to make sure that only the store owner is able to edit this store
    if (store.userEmail !== userEmail) {
        throw new Error(
            `The user with the email ${userEmail} is not authorized to edit this order.`
        );
    }

    // TODO Check if step (value variable) in allowed values
    const setString = `status.steps.${step}`;
    const setObject = {};
    setObject[setString] = value;

    // update order
    let findAndUpdateResult = await updateOneAndReturnOperation(
        databaseEntity.ORDERS,
        { _id: orderId },
        setObject,
        'set'
    );

    let statusFinished = false;
    let statusSuccessfully = false;
    // Check if order is completed
    if (
        findAndUpdateResult.status.steps.orderReceived &&
        findAndUpdateResult.status.steps.paymentReceived &&
        findAndUpdateResult.status.steps.inDelivery
    ) {
        await updateOneOperation(
            databaseEntity.ORDERS,
            { _id: orderId },
            {
                'status.finished': true,
                'status.successfully': true,
            },
            'set'
        );
        statusFinished = true;
        statusSuccessfully = true;
    }

    if (step === 'inDelivery') {
        const options = {
            contentType: contentType.ORDER_STATUS_IN_DELIVERY,
            email: findAndUpdateResult.user.email,
            orderId: findAndUpdateResult._id,
        };
        try {
            await sendNodemailerMail(options);
        } catch (error) {
            console.log(`Error at sending email.`);
            throw error;
        }
    }

    return { statusFinished, statusSuccessfully };
}

async function searchOrderByTermService(storeId, userEmail, searchTerm) {
    const store = await readOneOperation(databaseEntity.STORES, {
        _id: storeId,
    });
    if (!store) {
        throw new Error(`The store with the id ${storeId} could not be found.`);
    }
    //Guard to make sure that only the store owner is able to edit this store
    if (store.userEmail !== userEmail) {
        throw new Error(
            `The user with the email ${userEmail} is unauthorized to fetch the orders of this store.`
        );
    }

    let queryArray = [];
    if (searchTerm !== '') {
        queryArray.push({
            $text: { $search: searchTerm, $caseSensitive: false },
        });
    }
    queryArray.push({ storeId: storeId });
    // const searchTerm = req.query.search;
    console.log(queryArray);
    const orders = await readManyOperation(
        databaseEntity.ORDERS,
        {
            $and: queryArray,
        },
        {},
        { datetimeCreated: -1 }
    );

    return orders;
    // const resultArray = await collectionOrders
    //     .find({
    //         $and: queryArray,
    //         // { score: { $meta: 'textScore' } }
    //     })
    //     .sort({ datetimeCreated: -1 })
    //     // .project({ score: { $meta: 'textScore' } })
    //     // .sort({ score: { $meta: 'textScore' } })
    //     .toArray();
    // console.log(resultArray);
    // return resultArray;
    // res.status(200).json(resultArray);
}
