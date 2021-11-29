import MongoClient from 'mongodb';
import {
    APP_ENV,
    checkEnvironment,
    // MONGODB_URL_DEV_LOCAL,
    MONGODB_URL,
    MONGODB_NAME,
    MONGODB_URL_LOCAL,
    // COSMOSDB_URL,
    // COSMOSDB_NAME,
    // MONGO_ATLAS_DEV_URL,
    // MONGO_ATLAS_PW,
} from '../../config';

export {
    connectMongoDbClient,
    getMongoDbClient,
    disconnectMongoDbClient,
    getMongoDbTransactionWriteOptions,
};

let _client;

// async function connectMongoDbClient2() {
//     try {
//         const client = await MongoClient.connect(COSMOSDB_URL, {
//             useUnifiedTopology: true,
//         });
//         await client.db(COSMOSDB_NAME).command({ ping: 1 });
//         _client = client;
//     } catch (err) {
//         throw err;
//     }
// }

/**
 * MAIN MONGODB CONNECTION FUNCTION
 *
 */
async function connectMongoDbClient() {
    try {
        const client = await MongoClient.connect(MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(
            `MONGODB PING: ${JSON.stringify(
                await client.db(MONGODB_NAME).command({ ping: 1 })
            )}`
        );
        console.log(`[SUCCESSFULLY CONNECTED TO MONGODB]`);
        _client = client;
    } catch (error) {
        console.log(error);
        console.log(`[CONNECTION TO MONGODB COULD NOT BE ESTABLISHED]`);
        // when no connection could be created to the cloud mongodb, we connect locally but only in during development or testing
        if (
            checkEnvironment() === APP_ENV.DEV ||
            checkEnvironment() === APP_ENV.TEST
        ) {
            try {
                console.log(`[TRYING TO CONNECT LOCAL MONGODB]`);
                await connectMongoDbClientLocal();
                console.log(`[CONNECTED TO LOCAL MONGODB]`);
            } catch (error) {
                console.log(error);
                throw error;
            }
            return;
        }
        throw error;
    }
}

async function connectMongoDbClientLocal() {
    console.log(`LOCAL CONNECTION WITH URL: ${MONGODB_URL_LOCAL}`);
    const client = await MongoClient.connect(MONGODB_URL_LOCAL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    _client = client;
}

function getMongoDbClient() {
    // console.log(`at get client`);
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
