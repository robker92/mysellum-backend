const api = require('./src/api');
const config = require('./src/config');
const mongodb = require('./src/mongodb');


mongodb.connectClient(function (err, client) {
    if (err) console.log(err);

    api.listen(config.port, function () {
        console.log("Server started on port " + config.port);
    });
    // start the rest of your app here
});

/*
const insertDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([{
        a: 1
    }, {
        a: 2
    }, {
        a: 3
    }], function (err, result) {
        assert.equal(err, null);
        assert.equal(3, result.result.n);
        assert.equal(3, result.ops.length);
        console.log("Inserted 3 documents into the collection");
        callback(result);
    });
}

const findDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs)
        callback(docs);
    });
}
*/