'use strict';
//App imports
import {
    getMongoDBClient,
    getMongoDBTransactionWriteOptions,
} from '../../mongodb/setup';

import { ObjectId } from 'mongodb';

import {
    getMongoStoresCollection,
    getMongoOrdersCollection,
    getMongoProductsCollection,
    getMongoUsersCollection,
} from '../../mongodb/collections';

import { removeDuplicatesFromArray } from '../../utils/arrayFunctions';
import { getOrderModel } from '../../data-models/order-model';
import { sendNodemailerMail } from '../../mailing/nodemailer';
import { contentType } from '../../mailing/enums/contentType';

const getSingleOrder = async function (req, res, next) {
    let collection = await getMongoOrdersCollection();
    let id = req.params.id;

    let result = await collection.findOne({
        id: id,
    });
    //console.log(result);
    res.send(result);
};

const getStoresOrders = async function (req, res, next) {
    let {
        // searchTerm,
        // countries,
        // states,
        // cities,
        // sort,
        // pickup,
        // delivery,
        pageSize,
        pageNum,
    } = req.query;
    console.log(JSON.stringify(req.query));

    const collectionOrders = await getMongoOrdersCollection();
    const collectionStores = await getMongoStoresCollection();
    // const storeId = req.params.storeId;
    const userEmail = req.userEmail;

    let findResult = await collectionStores.findOne({
        // _id: ObjectId(storeId),
        userEmail: userEmail,
    });
    if (!findResult) {
        return next({
            status: 400,
            message: 'Store not found.',
        });
    }
    //Guard to make sure that only the store owner is able to edit this store
    // if (findResult.userEmail !== userEmail) {
    //     return next({
    //         status: 400,
    //         message: 'User unauthorized to edit this store.',
    //     });
    // }

    // Add filters, sort etc
    let queryArray = [];
    queryArray.push({ storeId: ObjectId(findResult._id).toString() });
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

    return res.status(200).json({
        orders: resultOrders,
        totalCount: totalCount,
    });
};

const getUsersOrders = async function (req, res, next) {
    let collection = await getMongoOrdersCollection();
    let userEmail = req.userEmail;
    //let storeId = req.params.storeId;

    let result = await collection
        .find({
            'user.email': userEmail,
        })
        .sort({ datetimeCreated: 1 })
        .toArray();
    // console.log(result);

    res.status(200).json({
        success: true,
        orders: result,
    });
};

const getAllOrders = async function (req, res, next) {
    let collection = await getMongoOrdersCollection();

    let result = await collection.find().toArray();
    //console.log(result)
    res.status(200).send(result);
};

const updateOrder = async function (req, res, next) {
    //function for changing user data except password and email!
    let collection = await getMongoOrdersCollection();
    let id = req.params.id;
    let data = req.body; //json format

    //password routine
    // if (data['password']) {
    //     delete data['password'];
    // };
    // if (data['email']) {
    //     delete data['email'];
    // };

    let result = await collection.updateOne(
        {
            //Selection criteria
            id: id,
        },
        {
            //Updated data
            $set: data,
        }
    );

    res.status(200).json({
        success: true,
        message: 'Order successfully updated!',
        queryResult: result,
    });
};

const deleteOrder = async function (req, res, next) {
    let collection = await getMongoOrdersCollection();
    let id = req.params.id;

    let result = await collection.remove({
        id: id,
    });

    res.status(200).json({
        success: true,
        message: 'Order successfully deleted!',
        queryResult: result,
    });
};

const createOrder = async function (req, res, next) {
    // const collectionOrders = await getMongoOrdersCollection();
    // const collectionStores = await getMongoStoresCollection();
    const data = req.body;
    const userEmail = req.userEmail;
    const products = req.body.products;

    const orderObject = await createOrderDataStructure(products);
    //const storeIds = Object.keys(product)
    console.log(orderObject);
    //console.log(orderObject["602593c01bda2d795c8a0caa"][0].product);

    const orderArray = await createOrderArray(orderObject, data);
    console.log(orderArray);
    await insertOrdersAndUpdateStocks(orderArray, orderObject, userEmail);
    // Then create a single order for each store

    console.log('all done.');

    res.status(200).json({
        success: true,
        message: 'Order creation successful!',
    });
    return;
};

async function createOrderDataStructure(products) {
    // Create a data structure like: { "storeId 1": [{product: "", amount: ""}, {product: "", amount: ""}], "storeId 2": [] }
    let orderObject = {};
    for (let i = 0; i < products.length; i++) {
        //Check if store id in order object, if not add it
        if (!(products[i][0].storeId in orderObject)) {
            //Validate if store id exists
            await validateStoreId(products[i][0].storeId);
            orderObject[products[i][0].storeId] = [
                { product: products[i][0], amount: products[i][1] },
            ];
            continue;
        }
        orderObject[products[i][0].storeId].push({
            product: products[i][0],
            amount: products[i][1],
        });
    }
    return orderObject;
}

async function validateStoreId(storeId) {
    const collectionStores = await getMongoStoresCollection();
    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });
    if (!findResult) {
        throw new Error('Wrong store id provided!');
    }
    return;
}

async function createOrderArray(orderObject, data) {
    let orderArray = [];
    //iterate over stores
    const storeIds = Object.keys(orderObject);
    for (const storeId of storeIds) {
        let productArray = orderObject[storeId];

        const orderOptions = {
            storeId: storeId,
            userEmail: data.user.email,
            datetimeCreated: new Date().toISOString(),
            datetimeAdjusted: '',
            shippingType: data.type,
            payment: data.payment,
            currency: data.currency,
            currencySymbol: data.currencySymbol,
            totalSum: 0,
            billingAddress: data.billingAddress,
            shippingAddress: data.shippingAddress,
        };
        const order = getOrderModel(orderOptions);

        let totalSum;
        //iterate over products
        for (let i = 0; i < productArray.length; i++) {
            //check if product exists and use it in the order
            let product = await fetchAndValidateProduct(productArray[i]);
            order.products.push(product);
            totalSum = totalSum + product.priceFloat;
        }
        order.totalSum = totalSum.toFixed(2);
        orderArray.push(order);
    }
    return orderArray;
}

async function fetchAndValidateProduct(data) {
    const collectionProducts = await getMongoProductsCollection();
    let orderedProduct = data.product;
    let orderedAmount = data.amount;

    let findResult = await collectionProducts.findOne({
        _id: ObjectId(orderedProduct._id),
    });
    if (!findResult) {
        throw new Error('Wrong product id provided!');
    }
    if (orderedAmount > findResult.stockAmount) {
        throw new Error('Product out of stock!');
    }
    return findResult;
}

async function insertOrdersAndUpdateStocks(orderArray, orderObject, email) {
    const collectionUsers = await getMongoUsersCollection();
    //Start MongoDB transaction session
    const session = getMongoDBClient().startSession();

    try {
        await session.withTransaction(async () => {
            let promises = [];
            //save new stocks
            promises.push(
                updateProductStockAmount(orderArray, orderObject, session)
            );
            //create orders
            promises.push(insertOrders(orderArray, session));

            await Promise.all(promises);

            //empty shopping cart
            await collectionUsers.updateOne(
                {
                    email: email,
                },
                {
                    $set: {
                        shoppingCart: [],
                    },
                },
                { session }
            );
        }, getMongoDBTransactionWriteOptions());
    } catch (e) {
        console.log(
            'The transaction was aborted due to an unexpected error: ' + e
        );
        return next({
            status: 400,
            message: 'Error while creating the order.',
        });
    } finally {
        await session.endSession();
    }
    return;
}

async function updateProductStockAmount(orderArray, orderObject, session) {
    const collectionProducts = await getMongoProductsCollection();

    let updates = [];
    const storeIds = Object.keys(orderObject);
    for (const storeId of storeIds) {
        let productArray = orderObject[storeId];
        for (let i = 0; i < productArray.length; i++) {
            //check if
            updates[i] = collectionProducts.findOneAndUpdate(
                {
                    _id: ObjectId(productArray[i].product._id),
                },
                {
                    $inc: {
                        stockAmount: -productArray[i].amount, //reduce stock amount by purchased amount
                    },
                },
                {
                    upsert: false,
                },
                { session }
            );
        }
    }

    await Promise.all(updates);
    return;
}

async function insertOrders(orderArray, session) {
    const collectionOrders = await getMongoOrdersCollection();

    let insertions = [];
    for (var i = 0; i < orderArray.length; i++) {
        insertions[i] = collectionOrders.insertOne(orderArray[i], { session });
    }

    await Promise.all(insertions);
    return;
}

const createOrder2 = async function (req, res, next) {
    const collectionOrders = await getMongoOrdersCollection();
    const collectionStores = await getMongoStoresCollection();
    const data = req.body;
    const products = req.body.products;

    let foundStoresPromiseArray = [];
    for (let i = 0; i < products.length; i++) {
        //Find stores with contained products in DB
        foundStoresPromiseArray[i] = collectionStores.findOne({
            _id: ObjectId(products[i][0].storeId),
            'profileData.products._id': products[i][0]._id,
        });
    }
    //TODO single store id false?
    let foundStores;
    console.log(foundStores);
    try {
        foundStores = await Promise.all(foundStoresPromiseArray);
    } catch (error) {
        //Error while searching for stores
        return next({
            status: 400,
            message: 'Wrong store Ids provided.',
        });
    }

    removeDuplicatesFromArray(foundStores);
    console.log(foundStores);

    // console.log(foundStores)
    let productsOutOfStock = [];
    for (let i = 0; i < foundStores.length; i++) {
        //Get the ordered product from the store which was fetched from the db
        let orderedProductFromStore = foundStores[i].profileData.products.find(
            (obj) => {
                return obj._id === products[i][0]._id;
            }
        );
        console.log(orderedProductFromStore);
        if (!orderedProductFromStore) {
            return next({
                status: 400,
                message: 'Wrong product Id provided.',
            });
        }
        //console.log(`ordered product: ${JSON.stringify(orderedProductFromStore)}`)
        //Check if the stock amount is bigger than the ordered amount
        if (orderedProductFromStore.stockAmount < products[i][1]) {
            productsOutOfStock.push(products[i][0]);
        }
    }

    //abort
    if (productsOutOfStock.length > 0) {
        return next({
            status: 500,
            success: false,
            message: 'Products out of stock',
            productsOutOfStock: productsOutOfStock,
        });
    }

    //TODO order data model

    //Start MongoDB transaction session
    const session = getMongoDBClient().startSession();

    try {
        await session.withTransaction(async () => {
            let updates = [];
            for (let i = 0; i < products.length; i++) {
                //check if
                updates[i] = collectionStores.findOneAndUpdate(
                    {
                        _id: ObjectId(products[i][0].storeId),
                        'profileData.products._id': products[i][0]._id,
                    },
                    {
                        $inc: {
                            'profileData.products.$.stockAmount':
                                -products[i][1], //reduce stock amount by purchased amount
                        },
                    },
                    {
                        upsert: false,
                    }
                );
            }

            await Promise.all(updates);
            //TODO One order per store
            let orderCreation = await collectionOrders.insertOne(data);
            //console.log(orderCreation)
        }, mongodb.getTransactionWriteOptions());
    } catch (e) {
        console.log(
            'The transaction was aborted due to an unexpected error: ' + e
        );
        return next({
            status: 400,
            message: 'Error while creating the order.',
        });
    } finally {
        await session.endSession();
    }

    //Check and send the order creation notification to the store owners
    for (let i = 0; i < foundStores.length; i++) {
        if (foundStores[i].notification.receivedOrder === true) {
            let mailOptions = {
                email: foundStores[i].userEmail,
                contentType: 'orderCreation',
                orderData: {
                    id: orderCreation._id,
                },
            };
            await sendNodemailerMail(mailOptions);
        }
        //checkOrderCreationNotification(foundStores[i].notification, foundStores[i].userEmail, orderCreation._id)
    }
    //TODO Notification Product now out of stock or below defined limit
    res.status(200).json({
        success: true,
        message: 'Order creation successful!',
    });
};

const setStepStatus = async function (req, res, next) {
    const collectionOrders = await getMongoOrdersCollection();
    const collectionStores = await getMongoStoresCollection();
    const storeId = req.body.storeId;
    const orderId = req.body.orderId;
    const userEmail = req.userEmail;
    const step = req.body.step;
    const value = req.body.value;
    const type = req.body.type;
    console.log(userEmail);

    // Fetch store and validate store owner
    let findResult = await collectionStores.findOne({
        _id: ObjectId(storeId),
    });
    if (!findResult) {
        return next({
            status: 500,
            message: 'Store not found.',
        });
    }
    //Guard to make sure that only the store owner is able to edit this store
    if (findResult.userEmail !== userEmail) {
        return next({
            status: 500,
            message: 'User unauthorized.',
        });
    }

    // TODO Check if step in allowed values
    const setString = `status.steps.${step}`;
    const setObject = {};
    setObject[setString] = value;

    // update order
    let findAndUpdateResult = await collectionOrders.findOneAndUpdate(
        {
            _id: ObjectId(orderId),
        },
        {
            $set: setObject,
        },
        {
            returnOriginal: false,
        }
    );
    if (!findAndUpdateResult || !findAndUpdateResult.ok) {
        return next({
            status: 500,
            message: 'Error at update.',
        });
    }

    let returnValueFinished = false;
    let returnValueSuccessfully = false;
    // Check if order is completed
    let updateResult;
    if (
        findAndUpdateResult.value.status.steps.orderReceived &&
        findAndUpdateResult.value.status.steps.paymentReceived &&
        findAndUpdateResult.value.status.steps.inDelivery
    ) {
        updateResult = await collectionOrders.updateOne(
            {
                _id: ObjectId(orderId),
            },
            {
                $set: {
                    'status.finished': true,
                    'status.successfully': true,
                },
            }
        );
        if (updateResult.result.nModified === 0) {
            console.log(`error at status update`);
        }
        returnValueFinished = true;
        returnValueSuccessfully = true;
    }

    if (step === 'inDelivery') {
        const options = {
            contentType: contentType.ORDER_STATUS_IN_DELIVERY,
            email: findAndUpdateResult.value.user.email,
            orderId: findAndUpdateResult.value._id,
        };
        try {
            await sendNodemailerMail(options);
        } catch (error) {
            console.log(`error`);
            throw error;
        }
    }

    res.status(200).json({
        statusFinished: returnValueFinished,
        statusSuccessfully: returnValueSuccessfully,
    });
    return;
};

// ##################################################################################### Search Orders
/**
 * The function searches the search term the in order model's text indexes
 * @param {string} searchTerm
 */
const searchOrderByTerm = async function (req, res, next) {
    const collectionOrders = await getMongoOrdersCollection();
    const collectionStores = await getMongoStoresCollection();
    const storeId = req.params.storeId;
    const userEmail = req.userEmail;
    const searchTerm = req.query.search || '';

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
            message: 'User unauthorized to fetch this stores orders.',
        });
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
    const resultArray = await collectionOrders
        .find({
            $and: queryArray,
            // { score: { $meta: 'textScore' } }
        })
        .sort({ datetimeCreated: -1 })
        // .project({ score: { $meta: 'textScore' } })
        // .sort({ score: { $meta: 'textScore' } })
        .toArray();
    // console.log(resultArray);
    // return resultArray;
    res.status(200).json(resultArray);
};

//===================================================================================================
export {
    getSingleOrder,
    getStoresOrders,
    getUsersOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    createOrder,
    createOrderDataStructure,
    setStepStatus,
    searchOrderByTerm,
};
//===================================================================================================
