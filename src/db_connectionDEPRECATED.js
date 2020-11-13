const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const config = require('./config');

var db_connection = function (callback) {
    //MongoClient.connect(url, callback)
    MongoClient.connect(config.mongoURL, {
        useUnifiedTopology: true
    }, function (err, client) {
        assert.equal(null, err);
        console.log("Connected correctly to mongo server");
    });
}

// Use connect method to connect to the server
// MongoClient.connect(config.mongoURL, {
//     useUnifiedTopology: true
// }, function (err, client) {
//     assert.equal(null, err);
//     console.log("Connected correctly to mongo server");

//     const db = client.db(config.mongodb_name);

//     // insertDocuments(db, function () {
//     //     findDocuments(db, function () {
//     //         client.close();
//     //     });
//     // });
// });

module.exports = {
    db_connection
}