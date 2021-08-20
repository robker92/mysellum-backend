// const pg = require('pg');
import pg from 'pg';
import { PG_DB_NAME, PG_DB_ADMIN_NAME, PG_DB_PW } from '../config';

export { connectPgClient, getPgClient, disconnectPgClient };

// const conString = `host=prjct-database.postgres.database.azure.com port=5432 dbname=postgres user=prjctAdminRob1@prjct-database password=${PG_DB_PW} sslmode=require`;
const config = {
    host: `${PG_DB_NAME}.postgres.database.azure.com`,
    user: PG_DB_ADMIN_NAME,
    password: PG_DB_PW,
    database: 'postgres',
    port: 5432,
    ssl: true,
    keepAlive: true,
};

let _pgClient;

async function connectPgClient() {
    try {
        const pgClient = new pg.Client(config);
        await pgClient.connect();
        _pgClient = pgClient;
    } catch (error) {
        console.log(error);
        throw error;
    }
    console.log('Azure PG connected');
}

function getPgClient() {
    return _pgClient;
}

async function disconnectPgClient() {
    await _pgClient.end();
    return;
}
