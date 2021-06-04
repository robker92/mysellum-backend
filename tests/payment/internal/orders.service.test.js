import { createOrderDataStructure } from '../../../src/payment/internal/orders.service';

describe('Tests for the MongoDB collection get functions', () => {
    beforeAll(async function () {
        await connectMongoDbClient();
    });
    afterAll(async function () {
        disconnectMongoDbClient();
    });

    it('getMongoStoresCollection', async function () {
        const collectionStores = await getMongoStoresCollection();
        expect(collectionStores).toBeTruthy();
    });
});
