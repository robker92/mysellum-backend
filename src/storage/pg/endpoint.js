// Packages
import express from 'express';
const routerPgTest = express.Router();

// import { sequelize, checkConnection } from './sequelize';
// import db from './sequelize';
import {
    readOneOperation,
    updateOperation,
    createOperation,
    deleteOneOperation,
    readAndCountAllOperation,
} from './operations';

export { routerPgTest };

const testingEndpoint = async function (req, res, next) {
    // const user = await db.user.findOne({ where: { id: 1 } });
    // console.log(user.id);

    // Delete #######################################################
    // const result = await deleteOneOperation('user', { id: 1 });
    // console.log(result);

    // Create #######################################################
    // const user = await createOperation('user', {
    //     firstName: 'Jane',
    //     lastName: 'Doe',
    //     email: 'Jane.Doe@web.de',
    //     password: 'TestPassword123',
    //     addressLine1: 'test',
    //     city: 'test',
    //     postcode: 'test',
    //     companyName: 'test',
    //     birthdate: 'test',
    //     favoriteStores: ['1234', '12345'],
    //     emailVerified: false,
    //     verifyRegistrationToken: 'test',
    //     verifyRegistrationExpires: 'test',
    //     deleted: false,
    //     blocked: false,
    // });
    // console.log(user.firstName);

    // Update #######################################################
    const update = await updateOperation(
        'user',
        {
            favoriteStores: [
                JSON.stringify({ id: '1234', field: 'test1' }),
                JSON.stringify({ id: '12345', field: 'test1' }),
            ],
        },
        { id: 4 }
    );
    if (!update) {
        console.log(`update unsucessful`);
    }
    console.log(update.firstName);

    // Read #######################################################
    const user2 = await readOneOperation('user', { id: 4 });
    if (!user2) {
        return res.sendStatus(500);
    }
    console.log(user2.favoriteStores);
    console.log(JSON.parse(user2.favoriteStores[0]));

    // Read And Count All ##########################################
    // const { count, rows } = await readAndCountAllOperation('user', { id: 2 });
    // console.log(count);
    // console.log(rows[0].firstName);

    // await db.checkConnection();

    return res.sendStatus(200);
};

routerPgTest.get(`/pg/test`, testingEndpoint);
