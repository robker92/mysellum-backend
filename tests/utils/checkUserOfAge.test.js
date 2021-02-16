import { userOfAge } from '../../src/utils/checkUserOfAge'

describe('Tests for the function which check if a user is of age (>18)', () => {
    beforeAll(async function () {
    });
    afterAll(async function () {
    });

    it('False: Year false', async function () {
        const birthDate = "18.08.2008";
        const result = userOfAge(birthDate);
        expect(result).toBe(false);
    }); 
    it('False: month false', async function () {
        const birthDate = "18.08.2003";
        const result = userOfAge(birthDate);
        expect(result).toBe(false);
    }); 
    it('False: day false', async function () {
        const birthDate = "18.02.2003";
        const result = userOfAge(birthDate);
        expect(result).toBe(false);
    }); 

    it('True: day okay', async function () {
        const birthDate = "05.02.2003";
        const result = userOfAge(birthDate);
        expect(result).toBe(true);
    }); 

    it('True: month okay', async function () {
        const birthDate = "05.01.2003";
        const result = userOfAge(birthDate);
        expect(result).toBe(true);
    }); 

    it('True: year okay', async function () {
        const birthDate = "05.01.2001";
        const result = userOfAge(birthDate);
        expect(result).toBe(true);
    }); 

    it('True: same day as current day', async function () {
        const birthDate = "06.02.2003";
        const result = userOfAge(birthDate);
        expect(result).toBe(true);
    }); 

    it('Error: wrong date format', async function () {
        const birthDate = "06.2.2003";

        expect(() => {
            userOfAge(birthDate);
        }).toThrow();
    }); 
});