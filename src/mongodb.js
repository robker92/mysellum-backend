const MongoClient = require('mongodb').MongoClient
const config = require('./config');
//const uri = 'mongodb://user:password@localhost:27017/dbName'
let _client;

// const connectClient = async function (callback) {
//     console.log(config.mongoURL)
//     try {
//         await MongoClient.connect(config.mongoURL, {
//             useUnifiedTopology: true
//         }, function (err, client) {
//             console.log(err)
//             _client = client
//             //return callback(err)
//             return err
//         })
//     } catch (e) {
//         throw e
//     }
// }

const connectClient = async function () {
    try {
        let client = await MongoClient.connect(config.mongoURL, {
            useUnifiedTopology: true
        });
        _client = client;
    } catch (err) {
        throw err
    }
}

const getClient = () => _client

const disconnectClient = () => _client.close()

const getTransactionWriteOptions = function () {
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

module.exports = {
    connectClient,
    getClient,
    disconnectClient,
    getTransactionWriteOptions
}