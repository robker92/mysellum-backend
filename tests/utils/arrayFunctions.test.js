import {removeDuplicatesFromArray} from '../../src/utils/arrayFunctions'


describe('Tests for the array utility functions', () => {
    beforeAll(async function () {
    });
    afterAll(async function () {
    });

    it('Remove duplicate values from string array', async function () {
        let array = ["a","b","a","c", "b","a", "c","b"]
        array = removeDuplicatesFromArray(array)
        console.log(array);
        expect(array.length).toBe(3);
    }); 
});