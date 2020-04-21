const MongoClient = require('mongodb').MongoClient
const config = require('./config');
//const uri = 'mongodb://user:password@localhost:27017/dbName'
let _client

const connectClient = async function (callback) {
    try {
        MongoClient.connect(config.mongoURL, {
            useUnifiedTopology: true
        }, function (err, client) {
            _client = client
            return callback(err)
        })
    } catch (e) {
        throw e
    }
}

const getClient = () => _client

const disconnectClient = () => _client.close()

module.exports = {
    connectClient,
    getClient,
    disconnectClient
}