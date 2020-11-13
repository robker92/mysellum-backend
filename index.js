const api = require('./src/api');
const config = require('./src/config');
const mongodb = require('./src/mongodb');


// mongodb.connectClient((err, client) => {
//     if (err) console.log(err);
//     // start the rest of your app here
//     api.listen(config.port, function () {
//         console.log("Server started on port " + config.port);
//     });
// });

mongodb.connectClient().then(() => {
    api.listen(config.port, function () {
        console.log("Server started on port " + config.port);
    });
});