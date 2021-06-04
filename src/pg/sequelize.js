import { Sequelize } from 'sequelize';

export { checkConnection };

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

var sequelize = new Sequelize(
    'postgres',
    'prjctAdminRob1@prjct-database',
    'BeK1188xhi!?-',
    {
        host: 'prjct-database.postgres.database.azure.com',
        dialect: 'postgres',
        pool: {
            max: 5,
            min: 0,
            idle: 10000,
        },
        dialectOptions: {
            encrypt: true,
            ssl: true,
            // keepALive: true,
        },
    }
);

// // Option 2: Passing parameters separately (other dialects)
// const sequelize = new Sequelize('database', 'username', 'password', {
//   host: 'localhost',
//   dialect: /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
// });

async function checkConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
