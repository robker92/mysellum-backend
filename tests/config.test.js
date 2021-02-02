import { PORT, MONGODB_URL,MONGODB_NAME,JWT_SECRET_KEY,JWT_KEY_EXPIRE,
    PW_HASH_SALT_ROUNDS,PW_RESET_TOKEN_NUM_BYTES,MAIL_USER,
    MAIL_PW,JSON_LIMIT,URL_ENCODED_LIMIT, MULTER_LIMIT } from '../src/config'


describe('Tests for the MongoDB setup module', () => {
    beforeAll(async function () {
    });
    afterAll(async function () {
    });

    it('Check config constants if they are truthy', async function () {
        expect(PORT).toBeTruthy();
        expect(MONGODB_URL).toBeTruthy();
        expect(MONGODB_NAME).toBeTruthy();
        expect(JWT_SECRET_KEY).toBeTruthy();
        expect(JWT_KEY_EXPIRE).toBeTruthy();
        expect(PW_HASH_SALT_ROUNDS).toBeTruthy();
        expect(PW_RESET_TOKEN_NUM_BYTES).toBeTruthy();
        expect(MAIL_USER).toBeTruthy();
        expect(MAIL_PW).toBeTruthy();
        expect(JSON_LIMIT).toBeTruthy();
        expect(URL_ENCODED_LIMIT).toBeTruthy();
        expect(MULTER_LIMIT).toBeTruthy();
    }); 
});