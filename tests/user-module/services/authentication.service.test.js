'use strict';

import {
    loginUserService,
    registerUserService,
    verifyRegistrationService,
    resendVerificationEmailService,
    sendPasswordResetMailService,
    checkResetTokenService,
    resetPasswordService,
} from '../../../src/user-module/services/authentication.service';

import {
    connectMongoDbClient,
    disconnectMongoDBClient,
    getClient,
} from '../../../src/storage/mongodb/setup';

import {
    readOneOperation,
    updateOneOperation,
    updateOneAndReturnOperation,
    readManyOperation,
    deleteOneOperation,
    deleteManyOperation,
    createOneOperation,
    countDocumentsOperation,
    databaseEntity,
} from '../../../src/storage/database-operations';
// import { readOneOperation } from '../../../src/storage/database-operations/read-one-operation';
// import { deleteOneOperation } from '../../../src/storage/database-operations/delete-one-operation';
// import { updateOneOperation } from '../../../src/storage/database-operations/update-one-operation';
// import { createOneOperation } from '../../../src/storage/database-operations/create-one-operation';
// import { updateOneAndReturnOperation } from '../../../src/storage/database-operations/update-one-and-return-operation';
// import { countDocumentsOperation } from '../../../src/storage/database-operations/count-documents';
// import { databaseEntity } from '../../../src/storage/utils/database-entity';

jest.mock(
    '../../../src/storage/database-operations/update-one-operation',
    () => ({
        updateOneOperation: jest.fn(),
    })
);

// jest.mock('../src/mailing/nodemailer', () => ({
//     ...jest.requireActual('../../../src/mailing/nodemailer'),
//     sendNodemailerMail: jest.fn(),
// }));
// import { sendNodemailerMail } from '../../../src/mailing/nodemailer';
// jest.mock('../../../src/mailing/nodemailer', () => ({
//     sendNodemailerMail: jest.fn(),
// }));

jest.mock('../../../src/mailing/nodemailer', () => ({
    ...jest.requireActual('../../../src/mailing/nodemailer'),
    sendNodemailerMail: jest.fn(),
}));
import { sendNodemailerMail } from '../../../src/mailing/nodemailer';

// Here we test the actual functionality of the authentication services
describe('user-module authentication.service Tests ', () => {
    let mockEmail = 'TestEmail1@web.de';
    let mockPassword = 'Test1aaa!';
    const correctMockPayload = {
        email: mockEmail,
        password: mockPassword,
        //should not validate
        firstName: 'MockFirstName',
        lastName: 'MockLastName',
        birthdate: '01.01.2011',
        city: 'MockCity',
        postcode: '00001',
        addressLine1: 'MockAddressLine1 11',
    };

    beforeAll(async function () {
        // console.log(process.env.NODE_ENV);

        await connectMongoDbClient();
        // await deleteOneOperation(databaseEntity.USERS, { email: mockEmail });
    });
    afterAll(async function () {
        await deleteOneOperation(databaseEntity.USERS, { email: mockEmail });
        disconnectMongoDBClient();
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('Success: Register a new user', async function () {
        await registerUserService(correctMockPayload);
        // verify that the user was created
        const user = await readOneOperation(databaseEntity.USERS, {
            email: mockEmail,
        });
        expect(user.email).toBe(mockEmail);
        // everything went fine, when the nodemailer function was reached
        expect(sendNodemailerMail.mock.calls.length).toBe(1);
        // delete the user again
        // await deleteOneOperation(databaseEntity.USERS, { email: mockEmail });
    });

    it('Fail: Try to register user whose email is already registered', async function () {
        // const user = await readOneOperation(databaseEntity.USERS, {
        //     email: mockEmail,
        // });

        // console.log(user.email);

        let thrownError;

        try {
            await registerUserService(correctMockPayload);
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError.type).toEqual('alreadyUsed');

        // if a normal error would have been thrown:
        // await expect(registerUserService(correctMockPayload)).rejects.toThrow();
    });

    it('Success: Resend verification e-mail', async function () {
        await resendVerificationEmailService(
            correctMockPayload.email,
            correctMockPayload.birthdate
        );

        expect(sendNodemailerMail.mock.calls.length).toBe(1);
    });

    it('Fail: Try to resend ver. e-mail with wrong e-mail', async function () {
        let thrownError;
        try {
            await resendVerificationEmailService(
                'wrongEmail',
                correctMockPayload.birthday
            );
        } catch (error) {
            thrownError = error;
        }
        expect(thrownError.type).toEqual('emailUnknown');
    });

    it('Fail: Try to resend ver. e-mail with wrong birthdate', async function () {
        let thrownError;
        try {
            await resendVerificationEmailService(
                correctMockPayload.email,
                'wrongBirthdate'
            );
        } catch (error) {
            thrownError = error;
        }
        expect(thrownError.type).toEqual('unauthorized');
    });

    it('Fail: Try to resend ver. e-mail for blocked user', async function () {
        // set the user to blocked
        await updateOneOperation(
            databaseEntity.USERS,
            {
                email: mockEmail,
            },
            { blocked: true }
        );

        let thrownError;
        try {
            await resendVerificationEmailService(
                correctMockPayload.email,
                'wrongBirthdate'
            );
        } catch (error) {
            thrownError = error;
        }
        expect(thrownError.type).toEqual('unauthorized');

        // undo blocking
        await updateOneOperation(
            databaseEntity.USERS,
            {
                email: mockEmail,
            },
            { blocked: false }
        );
    });

    it('Fail: Try to resend ver. e-mail for deleted user', async function () {
        // set the user to deleted
        await updateOneOperation(
            databaseEntity.USERS,
            {
                email: mockEmail,
            },
            { deleted: true }
        );

        let thrownError;
        try {
            await resendVerificationEmailService(
                correctMockPayload.email,
                'wrongBirthdate'
            );
        } catch (error) {
            thrownError = error;
        }
        expect(thrownError.type).toEqual('unauthorized');

        // undo deletion
        await updateOneOperation(
            databaseEntity.USERS,
            {
                email: mockEmail,
            },
            { deleted: false }
        );
    });

    it('Fail: Try to resend ver. e-mail for already verified user', async function () {
        // set the user to deleted
        await updateOneOperation(
            databaseEntity.USERS,
            {
                email: mockEmail,
            },
            { emailVerified: true }
        );

        let thrownError;
        try {
            await resendVerificationEmailService(
                correctMockPayload.email,
                'wrongBirthdate'
            );
        } catch (error) {
            thrownError = error;
        }
        expect(thrownError.type).toEqual('unauthorized');

        // undo deletion
        await updateOneOperation(
            databaseEntity.USERS,
            {
                email: mockEmail,
            },
            { emailVerified: false }
        );
    });

    it('Success: Verify the registration', async function () {
        const user = await readOneOperation(databaseEntity.USERS, {
            email: mockEmail,
        });
        const token = user.verifyRegistrationToken;

        const { accessToken, userData } = await verifyRegistrationService(
            token
        );

        expect(accessToken).toBeTruthy();
    });

    it('Fail: Try to verify with wrong token', async function () {
        const wrongToken = '123456789abcdefgh';
        let thrownError;

        try {
            await verifyRegistrationService(wrongToken);
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError.type).toEqual('verification');
    });

    it('Success: Login user', async function () {
        const { accessToken, userData } = await loginUserService(
            correctMockPayload.email,
            correctMockPayload.password
        );

        expect(accessToken).toBeTruthy();
    });

    it('Fail: Try to login user with wrong email', async function () {
        let thrownError;

        try {
            await loginUserService('wrongEmail', correctMockPayload.password);
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError.type).toEqual('incorrect');

        // await expect(
        //     loginUserService('wrongEmail', correctMockPayload.password)
        // ).rejects.toThrow();
    });

    it('Fail: Try to login user with wrong password', async function () {
        let thrownError;

        try {
            await loginUserService(correctMockPayload.email, 'wrongPassword');
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError.type).toEqual('incorrect');

        // await expect(
        //     loginUserService(correctMockPayload.email, 'wrongPassword')
        // ).rejects.toThrow();
    });

    it('Success: Send password reset e-mail', async function () {
        await sendPasswordResetMailService(
            correctMockPayload.email,
            correctMockPayload.birthdate
        );

        expect(sendNodemailerMail.mock.calls.length).toBe(1);
    });

    it('Fail: Try to send pw reset e-mail with wrong email', async function () {
        let thrownError;

        try {
            await sendPasswordResetMailService(
                'wrongEmail',
                correctMockPayload.birthdate
            );
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError.type).toEqual('notFound');
    });

    it('Fail: Try to send pw reset e-mail with wrong birthdate', async function () {
        let thrownError;

        try {
            await sendPasswordResetMailService(
                correctMockPayload.email,
                'wrongBirthdate'
            );
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError.type).toEqual('notFound');
    });
});
