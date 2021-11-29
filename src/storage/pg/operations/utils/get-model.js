import { db } from '../../sequelize';
import { seqDatabaseEntity } from './database-entity';

export { getModel };

/**
 * Returns the database model according to the given model
 * @param {string} modelIdentifier values: user, store, product, review, order, // storeImage
 * @returns the db model
 * @throws an error if the given model is not supported
 */
function getModel(modelIdentifier) {
    let model;
    switch (modelIdentifier) {
        case seqDatabaseEntity.USER:
            model = db.user;
            break;
        case seqDatabaseEntity.STORE:
            model = db.store;
            break;
        case seqDatabaseEntity.PRODUCT:
            model = db.product;
            break;
        case seqDatabaseEntity.REVIEW:
            model = db.review;
            break;
        case seqDatabaseEntity.ORDER:
            model = db.order;
            break;
        // case seqDatabaseEntity.PRODUCT_AVAIL_NOTIF:
        // model = db.productAvailNotif;
        // break;
        // case 'storeImage':
        //     model = db.storeImage;
        //     break;

        default:
            break;
    }

    if (!model) {
        throw new Error(`The DB model "${modelIdentifier}" was not found!`);
    }

    return model;
}
