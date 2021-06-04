// import {
//     getUserById,
//     getUserByEmail,
//     getUserByResetToken,
//     getAllUsers,
// } from './users/get-users';
// import { deleteUserById, deleteUserByEmail } from './users/delete-users';
// import { createUser } from './users/create-users';
import { updateOneOperation } from './database-operations/update-one-operation';
import { readOneOperation } from './database-operations/read-one-operation';
import { deleteOneOperation } from './database-operations/delete-one-operation';
import { createOneOperation } from './database-operations/create-one-operation';

const testingEndpoint = async function (req, res, next) {
    const body = req.body;
    const param = req.param.test;

    // const result = await updateSingleOperation(
    //     'users',
    //     { email: body.email },
    //     { hi: 2 }
    // );
    const result = await readOneOperation('users', { email: body.email });
    console.log(result);
    res.status(200).json(result);
};

export { testingEndpoint };
