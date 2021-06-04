import { MONGODB_URL } from '../../src/config';
import {
    connectMongoDbClient,
    getMongoDbClient,
    disconnectMongoDbClient,
    getMongoDBTransactionWriteOptions,
} from '../../src/mongodb/setup';
import { getMongoUsersCollection } from '../../src/mongodb/collections';

describe('Tests for the MongoDB setup module', () => {
    beforeAll(async function () {});
    afterAll(async function () {
        disconnectMongoDbClient();
    });

    it('Connect: Should return the connected client', async function () {
        await connectMongoDbClient();
        const client = getMongoDbClient();
        console.log(client);
        expect(client.s.url).toBe(MONGODB_URL);
    });

    it('Disconnect: Should not return a client', async function () {
        await connectMongoDbClient();
        disconnectMongoDbClient();

        let collectionUsers = await getMongoUsersCollection();
        let error = false;
        try {
            await collectionUsers.find({}).toArray();
        } catch (err) {
            error = true;
        }
        expect(error).toBe(true);
    });

    it('Get Write Transaction Options', async function () {
        const options = getMongoDBTransactionWriteOptions();

        expect(options.writeConcern.w).toBe('majority');
    });
});
