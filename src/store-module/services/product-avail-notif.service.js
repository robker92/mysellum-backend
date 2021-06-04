// database operations
import {
    readOneOperation,
    readManyOperation,
    deleteManyOperation,
    createOneOperation,
    databaseEntity,
} from '../../storage/database-operations';

export {
    registerProductAvailNotificationService,
    getNotificationsService,
    deleteNotificationService,
    sendNotificationsService,
};

/**
 * The function validates the provided storeId and productId and
 * creates the notification entity in the database.
 * @param {object} payload
 * @returns nothing. throws errors when soemthing went wrong or is not valid
 */
async function registerProductAvailNotificationService(payload) {
    // Validate Store
    const resultStore = await readOneOperation(databaseEntity.STORES, {
        _id: storeId,
    });
    if (!resultStore) {
        throw new Error(`Store not found. Store id (${storeId}) invalid.`);
    }

    // Validate product
    const resultProduct = await readOneOperation(databaseEntity.PRODUCTS, {
        _id: productId,
        storeId: storeId,
    });
    if (!resultProduct) {
        throw new Error(
            `Product not found. Product id (${productId}) invalid.`
        );
    }

    // Create Notification database entity
    const resultNotif = await createOneOperation(
        databaseEntity.PRODUCT_NOTIFICATIONS,
        payload
    );
    if (!resultNotif) {
        throw new Error(
            'Product notification registration unsuccessful. Error during creation.'
        );
    }

    return;
}

/**
 * The function fetches the registered product availability notifications to a storeId and productId
 * @param {string} storeId
 * @param {string} productId
 * @returns an array which contains the email addresses to which the notifications should be send
 */
async function getNotificationsService(storeId, productId) {
    let resultArray = [];

    let findResult = await readManyOperation(
        databaseEntity.PRODUCT_NOTIFICATIONS,
        {
            storeId: storeId,
            productId: productId,
        },
        {
            email: 1,
            _id: 0,
        }
    );

    // TODO Validate?
    for (let i = 0; i < findResult.length; i++) {
        resultArray.push(findResult[i].email);
    }
    console.log(resultArray);
    //return empty array if nothing is found
    // if (!findResult) {
    //     return [];
    // }
    return resultArray;
}

/**
 * The Function deletes all notification database entities according to the provided storeId and productId
 * @param {string} storeId
 * @param {string} productId
 */
async function deleteNotificationService(storeId, productId) {
    await deleteManyOperation(databaseEntity.PRODUCT_NOTIFICATIONS, {
        storeId: storeId,
        productId: productId,
    });
    // TODO Validate?
    return;
}

/**
 * The function gets the registered email addresses to receive a notification
 * and validates the provided product id and store id. It then sends the notifications
 *  and deletes them from the database.
 * @param {string} storeId
 * @param {string} productId
 * @returns
 */
async function sendNotificationsService(storeId, productId) {
    const emailArray = await getNotificationsService(storeId, productId);

    //if the array is empty, stop the function
    if (emailArray.length === 0) {
        console.log('No notifications registered!');
        return;
    }

    //Get the product
    const product = await readOneOperation(databaseEntity.PRODUCTS, {
        _id: productId,
        storeId: storeId,
    });
    if (!findproductResult) {
        throw new Error(
            `Product with the id ${productId} and the store id ${storeId} not found.`
        );
    }

    //send the notification mails
    for (const email of emailArray) {
        let mailOptions = {
            email: email,
            contentType: 'prdctAvNotif',
            storeId: storeId,
            productId: productId,
            product: product,
        };
        try {
            await sendNodemailerMail(mailOptions);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    // delete the send notifications from the database
    await deleteNotificationService(storeId, productId);

    return;
}
