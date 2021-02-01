import MongoClient from 'mongodb'
import {
    MONGODB_URL
} from '../config';

let _client;

const connectMongoDBClient = async function () {
    try {
        let client = await MongoClient.connect(MONGODB_URL, {
            useUnifiedTopology: true
        });
        _client = client;
    } catch (err) {
        throw err
    }
}

const getMongoDBClient = function () {
    return _client
}

const disconnectMongoDBClient = function () {
    _client.close()
}

const getMongoDBTransactionWriteOptions = function () {
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: {
            level: 'local'
        },
        writeConcern: {
            w: 'majority'
        }
    };
    return transactionOptions;
};

//===================================================================================================
export { connectMongoDBClient, getMongoDBClient, disconnectMongoDBClient, getMongoDBTransactionWriteOptions };
//===================================================================================================