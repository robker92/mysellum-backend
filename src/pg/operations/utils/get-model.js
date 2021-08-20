import { db } from '../../sequelize';

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
        case 'user':
            model = db.user;
            break;
        case 'store':
            model = db.store;
            break;
        case 'product':
            model = db.product;
            break;
        case 'review':
            model = db.review;
            break;
        case 'order':
            model = db.order;
            break;
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
