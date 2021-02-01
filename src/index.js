import api from './api';
import {
    PORT
} from './config';
import {
    connectMongoDBClient
} from './mongodb/setup';

// mongodb.connectClient((err, client) => {
//     if (err) console.log(err);
//     // start the rest of your app here
//     api.listen(config.port, function () {
//         console.log("Server started on port " + config.port);
//     });
// });

connectMongoDBClient().then(() => {
    api.listen(PORT, function () {
        console.log("Server started on port " + PORT);
    });
});