// const Sequelize = require('sequelize');
import { Sequelize } from 'sequelize';
// Models
import {
    getUserModel,
    getStoreModel,
    getReviewModel,
    getProductModel,
    getOrderModel,
    getStoreImageModel,
} from './models';
import {
    PG_DB_NAME,
    PG_DB_HOST,
    PG_DB_PORT,
    PG_DB_ADMIN_NAME,
    PG_DB_PW,
} from '../config';

export { db };

const sequelize = new Sequelize(PG_DB_NAME, PG_DB_ADMIN_NAME, PG_DB_PW, {
    host: PG_DB_HOST,
    port: PG_DB_PORT,
    dialect: 'postgres',
    // operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    // dialectOptions: {
    //     encrypt: true,
    //     // ssl: true,
    //     keepALive: true,
    // },
});

// Database object
const db = {};

// Models
const User = getUserModel(sequelize, Sequelize);
const Store = getStoreModel(sequelize, Sequelize);
const Review = getReviewModel(sequelize, Sequelize);
const Product = getProductModel(sequelize, Sequelize);
const Order = getOrderModel(sequelize, Sequelize);
const StoreImage = getStoreImageModel(sequelize, Sequelize);

// Associations (https://sequelize.org/v4/manual/tutorial/associations.html)
// <source>.function(<target>)
// User.hasOne(Store); // creates foreign key in target model
User.belongsTo(Store); // creates foreign key in source model
User.hasMany(Review); // creates foreign key in target model
User.hasMany(Order);

Store.hasMany(Review);
Store.hasMany(Product);
Store.hasMany(Order);
Store.hasMany(StoreImage);

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = User;
db.store = Store;
db.product = Product;
db.review = Review;
db.order = Order;
db.storeImage = StoreImage;

async function checkConnection() {
    try {
        // await sequelize.sync();
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// Option 1: Passing a connection URI
// const sequelize = new Sequelize('sqlite::memory:'); // Example for sqlite

// const config = {
//     url: 'postgres://prjctAdminRob1@prjct-database:BeK1188xhi!?-@prjct-database.postgres.database.azure.com:5432/postgres',
//     dialect: 'postgres',
// };

// const sequelize = new Sequelize(config.url); // Example for postgres

// // Option 2: Passing parameters separately (sqlite)
// const sequelize = new Sequelize({
//     dialect: config.dialect,
//     storage: config.url,
// });

// const sequelize = new Sequelize(
//     'postgres',
//     'prjctAdminRob1@prjct-database',
//     'BeK1188xhi!?-',
//     {
//         host: 'prjct-database.postgres.database.azure.com',
//         dialect: 'postgres',
//         pool: {
//             max: 5,
//             min: 0,
//             idle: 10000,
//         },
//         dialectOptions: {
//             encrypt: true,
//             ssl: true,
//             // keepALive: true,
//         },
//     }
// );

// // Option 2: Passing parameters separately (other dialects)
// const sequelize = new Sequelize('database', 'username', 'password', {
//   host: 'localhost',
//   dialect: /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
// });
