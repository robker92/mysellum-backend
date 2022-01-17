import { userOfAge } from '../../src/utils/checkUserOfAge';

describe('Tests for the function which check if a user is of age (>18)', () => {
    it('False: Year higher than (current - 18)', async function () {
        const birthDate = `18.08.2004`;
        const testCurrentDate = '2021-08-18T17:24:11.942Z';
        const result = userOfAge(birthDate, testCurrentDate);
        expect(result).toBe(false);
    });

    it('False: month higher than current', async function () {
        const birthDate = `18.08.2003`;
        const testCurrentDate = '2021-07-18T17:24:11.942Z';
        const result = userOfAge(birthDate, testCurrentDate);
        expect(result).toBe(false);
    });

    it('False: day higher than current', async function () {
        const birthDate = `18.07.2003`;
        const testCurrentDate = '2021-07-16T17:24:11.942Z';
        const result = userOfAge(birthDate, testCurrentDate);
        expect(result).toBe(false);
    });

    it('True: day lower than current', async function () {
        const birthDate = '17.07.2003';
        const testCurrentDate = '2021-07-18T17:24:11.942Z';
        const result = userOfAge(birthDate, testCurrentDate);
        expect(result).toBe(true);
    });

    it('True: month lower than current', async function () {
        const birthDate = '05.06.2003';
        const testCurrentDate = '2021-07-16T17:24:11.942Z';
        const result = userOfAge(birthDate, testCurrentDate);
        expect(result).toBe(true);
    });

    it('True: year lower than (current - 18)', async function () {
        const birthDate = '05.07.2001';
        const testCurrentDate = '2021-07-16T17:24:11.942Z';
        const result = userOfAge(birthDate, testCurrentDate);
        expect(result).toBe(true);
    });

    it('True: same day as current day', async function () {
        const birthDate = '06.02.2003';
        const testCurrentDate = '2021-02-06T17:24:11.942Z';
        const result = userOfAge(birthDate, testCurrentDate);
        expect(result).toBe(true);
    });

    it('Error: wrong date format', async function () {
        const birthDate = '06.2.2003';
        const testCurrentDate = '2021-02-06T17:24:11.942Z';

        expect(() => {
            userOfAge(birthDate, testCurrentDate);
        }).toThrow();
    });
});
