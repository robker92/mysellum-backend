import {
    getMongoDbCollection,
    getMongoCollectionUsers,
    getMongoCollectionStores,
    getMongoCollectionProducts,
    getMongoCollectionOrders,
    getMongoCollectionPrdctNotif,
} from '../../mongodb/collections';
import { databaseEntity } from './database-entity';

export { switchCollections };

/**
 * Returns the mongo db collections to the provided database entity
 * @param {string} entity
 * @returns mongodb collection
 */
function switchCollections(entity) {
    let collection;

    if (!Object.values(databaseEntity).includes(entity)) {
        throw new Error('Database entity not found in enum.');
    }

    collection = getMongoDbCollection(entity);

    // Old approach
    // switch (entity) {
    //     case databaseEntity.USERS:
    //         collection = getMongoCollectionUsers();
    //         break;
    //     case databaseEntity.STORES:
    //         collection = getMongoCollectionStores();
    //         break;
    //     case databaseEntity.PRODUCTS:
    //         collection = getMongoCollectionProducts();
    //         break;
    //     case databaseEntity.ORDERS:
    //         collection = getMongoCollectionOrders();
    //         break;
    //     case databaseEntity.PRODUCT_NOTIFICATIONS:
    //         collection = getMongoCollectionPrdctNotif();
    //         break;

    //     default:
    //         throw new Error(`Invalid entity (${entity}) provided`);
    // }
    return collection;
}
