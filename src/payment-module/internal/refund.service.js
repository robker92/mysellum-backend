'use strict';

import { getOrderModel } from '../../../src/data-models/order-model';

import { ObjectId } from 'mongodb';
import { sendNodemailerMail } from '../../mailing/nodemailer';
import { refundPaypalOrder } from '../paypal/rest/paypal-rest-client';
import { contentType } from '../../mailing/enums/contentType';

export { refundService };

async function refundService(orderId, products) {
    const session = getMongoDBClient().startSession();
    try {
        await session.withTransaction(async () => {
            // fetch order by id
            // mark products as refunded in order
            // adjust order values
            // send refund api request to paypal
            // Platform fees?

            await refundPaypalOrder();
        }, getMongoDBTransactionWriteOptions());
    } catch (e) {
        console.log(
            'The transaction was aborted due to an unexpected error: ' + e
        );
        throw e;
    } finally {
        await session.endSession();
    }
}
