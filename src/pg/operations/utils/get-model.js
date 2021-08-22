import { db } from '../../sequelize';
import { databaseEntity } from './database-entity';

export { getModel };
databaseEntity.USER;
/**
 * Returns the database model according to the given model
 * @param {string} modelIdentifier values: user, store, product, review, order, // storeImage
 * @returns the db model
 * @throws an error if the given model is not supported
 */
function getModel(modelIdentifier) {
    let model;
    switch (modelIdentifier) {
        case databaseEntity.USER:
            model = db.user;
            break;
        case databaseEntity.STORE:
            model = db.store;
            break;
        case databaseEntity.PRODUCT:
            model = db.product;
            break;
        case databaseEntity.REVIEW:
            model = db.review;
            break;
        case databaseEntity.ORDER:
            model = db.order;
            break;
        // case databaseEntity.PRODUCT_AVAIL_NOTIF:
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
