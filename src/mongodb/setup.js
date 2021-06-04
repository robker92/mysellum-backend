import MongoClient from 'mongodb';
import { MONGODB_URL, COSMOSDB_URL, COSMOSDB_NAME } from '../config';

let _client;

async function connectMongoDbClient() {
    try {
        const client = await MongoClient.connect(COSMOSDB_URL, {
            useUnifiedTopology: true,
        });
        await client.db(COSMOSDB_NAME).command({ ping: 1 });
        _client = client;
    } catch (err) {
        throw err;
    }
}

function getMongoDbClient() {
    return _client;
}

function disconnectMongoDbClient() {
    _client.close();
}

function getMongoDbTransactionWriteOptions() {
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: {
            level: 'local',
        },
        writeConcern: {
            w: 'majority',
        },
    };
    return transactionOptions;
}

//===================================================================================================
export {
    connectMongoDbClient,
    getMongoDbClient,
    disconnectMongoDbClient,
    getMongoDbTransactionWriteOptions,
};
//===================================================================================================
