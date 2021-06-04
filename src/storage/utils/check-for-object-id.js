import { ObjectId } from 'mongodb';

export { checkForObjectId };

/**
 * The function checks if the key '_id' is inside the queryObject.
 * If yes, it uses the ObjectId operator from mongodb to adjust the value
 * @param {object} queryObject
 * @returns
 */
function checkForObjectId(queryObject) {
    if ('_id' in queryObject) {
        queryObject._id = ObjectId(queryObject._id);
    }
    return queryObject;
}
