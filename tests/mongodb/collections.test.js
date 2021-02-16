import { getMongoStoresCollection, getMongoUsersCollection, getMongoProductsCollection } from '../../src/mongodb/collections'
import { connectMongoDBClient, disconnectMongoDBClient } from '../../src/mongodb/setup'
describe('Tests for the MongoDB collection get functions', () => {
    beforeAll(async function () {
        await connectMongoDBClient();
    });
    afterAll(async function () {
        disconnectMongoDBClient();
    });

    it('getMongoStoresCollection', async function () {
        const collectionStores = await getMongoStoresCollection();
        expect(collectionStores).toBeTruthy();
    }); 
    it('getMongoUsersCollection', async function () {
        const collectionUsers = await getMongoUsersCollection();
        expect(collectionUsers).toBeTruthy();
    });
    it('getMongoProductsCollection', async function () {
        const collectionProducts = await getMongoProductsCollection();
        expect(collectionProducts).toBeTruthy();
    });
});