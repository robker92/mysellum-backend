import { getMongoDbClient } from './setup';
import {
    MONGODB_NAME,
    // COSMOSDB_NAME
} from '../../config';

const databaseName = MONGODB_NAME;

function getMongoDbCollection(collection) {
    return getMongoDbClient().db(databaseName).collection(collection);
}

async function getMongoStoresCollection() {
    return getMongoDbClient().db(databaseName).collection('stores');
}
async function getMongoUsersCollection() {
    return getMongoDbClient().db(databaseName).collection('users');
}
async function getMongoProductsCollection() {
    return getMongoDbClient().db(databaseName).collection('products');
}
async function getMongoOrdersCollection() {
    return getMongoDbClient().db(databaseName).collection('orders');
}
async function getMongoPrdctNotifCollection() {
    return getMongoDbClient().db(databaseName).collection('prdctNotif');
}
function getMongoUsersCollection2() {
    return getMongoDbClient().db(databaseName).collection('users');
}

// New
function getMongoCollectionUsers() {
    return getMongoDbClient().db(databaseName).collection('users');
}
function getMongoCollectionStores() {
    return getMongoDbClient().db(databaseName).collection('stores');
}
function getMongoCollectionProducts() {
    return getMongoDbClient().db(databaseName).collection('products');
}
function getMongoCollectionOrders() {
    return getMongoDbClient().db(databaseName).collection('orders');
}
function getMongoCollectionPrdctNotif() {
    return getMongoDbClient().db(databaseName).collection('prdctNotif');
}

//===================================================================================================
export {
    getMongoDbCollection,
    //
    getMongoStoresCollection,
    getMongoUsersCollection,
    getMongoProductsCollection,
    getMongoOrdersCollection,
    getMongoPrdctNotifCollection,
    getMongoUsersCollection2,
    // New
    getMongoCollectionUsers,
    getMongoCollectionStores,
    getMongoCollectionProducts,
    getMongoCollectionOrders,
    getMongoCollectionPrdctNotif,
};
//===================================================================================================
