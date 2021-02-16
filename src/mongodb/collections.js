import {
    getMongoDBClient
} from '../mongodb/setup';
import {
    MONGODB_NAME
} from '../config';

async function getMongoStoresCollection() {
    return getMongoDBClient().db(MONGODB_NAME).collection("stores");
};
async function getMongoUsersCollection() {
    return getMongoDBClient().db(MONGODB_NAME).collection("users");
};
async function getMongoProductsCollection() {
    return getMongoDBClient().db(MONGODB_NAME).collection("products");
};
async function getMongoOrdersCollection() {
    return getMongoDBClient().db(MONGODB_NAME).collection("orders");
};
async function getMongoPrdctNotifCollection() {
    return getMongoDBClient().db(MONGODB_NAME).collection("prdctNotif");
};

//===================================================================================================
export { getMongoStoresCollection, getMongoUsersCollection, getMongoProductsCollection, 
    getMongoOrdersCollection, getMongoPrdctNotifCollection };
//===================================================================================================