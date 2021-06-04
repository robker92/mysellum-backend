import app from './app';
import { PORT, COSMOSDB_NAME } from './config';
import {
    disconnectMongoDbClient,
    connectMongoDbClient,
    getMongoDbClient,
} from './mongodb/setup';
// import { connectPgClient, disconnectPgClient } from './pg/client';
// import { checkConnection } from './pg/sequelize';

// // Create a function to terminate your app gracefully:
// function gracefulShutdown(event) {
//     console.log(`${event}: Close MongoDb connection.`);
//     disconnectMongoDbClient();
// }
// // This will handle process.exit():
// process.on('exit', gracefulShutdown('exit'));
// // This will handle kill commands, such as CTRL+C:
// process.on('SIGINT', gracefulShutdown('SIGINT'));
// process.on('SIGTERM', gracefulShutdown('SIGTERM'));
// process.on('SIGKILL', gracefulShutdown('SIGKILL'));
// // This will prevent dirty exit on code-fault crashes:
// process.on('uncaughtException', gracefulShutdown('uncaughtException'));

connectMongoDbClient().then(() => {
    // connectPgClient().then(() => {
    app.listen(PORT, function () {
        console.log('Server started on port ' + PORT);
    });

    // printAllRoutes();

    // getMongoDbClient()
    //     .db(COSMOSDB_NAME)
    //     .collection('users')
    //     .find({})
    //     .toArray()
    //     .then((res) => {
    //         console.log(res);
    //     });

    //     checkConnection().then(() => {
    //         console.log(`hi`);
    //     });
    // });
});

function printAllRoutes() {
    for (const element1 of app._router.stack) {
        if (Array.isArray(element1.handle.stack)) {
            for (const element2 of element1.handle.stack) {
                console.log(
                    `${Object.keys(element2.route.methods)[0]}: ${
                        element2.route.path
                    }`
                );
            }
        }
    }
}
