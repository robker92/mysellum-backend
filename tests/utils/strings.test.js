import { addCharacterToString } from '../../src/utils/strings';

describe('String Utils', () => {
    it('Success: Character successfully added to string', async function () {
        const result = addCharacterToString('400', '.', 1);

        expect(result).toBe('4.00');
    });
});
