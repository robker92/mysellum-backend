'use strict';
// database operations
import {
    readOneOperation,
    updateOneOperation,
    updateOneAndReturnOperation,
    readManyOperation,
    deleteOneOperation,
    deleteManyOperation,
    createOneOperation,
    databaseEntity,
} from '../../storage/database-operations';

export { getFilteredStoresService, getFilteredStores2Service };

/**
 *
 * @param {string} searchTerm
 * @returns
 */
async function getFilteredStoresService(searchTerm) {
    const result = await readManyOperation(databaseEntity.STORES, {
        'profileData.tags': {
            $eq: searchTerm,
        },
    });

    return result;
}

/**
 *
 * @param {object} filterObject
 * @returns
 */
async function getFilteredStores2Service(filterObject) {
    let queryFilter = {};
    for (let key in filterObject) {
        if (key === 'tags') {
            if (filterObject[key].length === 0) {
                throw new Error('Invalid filter provided.');
            }
            queryFilter[`profileData.${key}`] = {
                $all: filterObject[key], //matches all elements in array
            };
        }
        if (key === 'country') {
        }
    }
    //If no valid key is provided
    if (queryFilter === {}) {
        //TODO No Filter provided
    }
    console.log(queryFilter);

    // Fetch filtered Stores
    const result = await readManyOperation(databaseEntity.STORES, queryFilter);

    return result;
}

/**
 *
 * @param {object} filterObject
 * @returns
 */
//  async function getStoresDeliveryService(filterObject) {
//     let {
//         searchTerm,
//         countries,
//         states,
//         cities,
//         sort,
//         pickup,
//         delivery,
//         pageSize,
//         pageNum,
//     } = req.query;
//     console.log(JSON.stringify(req.query));

//     // Build search query
//     let queryArray = []; // will be added to the $and
//     let projectObjct = {}; // projection object
//     let sortObjct = {};
//     if (searchTerm !== undefined) {
//         queryArray.push(
//             // Search in indexed texts (title, description, tags)
//             {
//                 $text: {
//                     $search: searchTerm,
//                     $caseSensitive: false,
//                 },
//             }
//         );
//     }
//     // TODO - check if inputs are in list of possible values
//     if (countries !== undefined) {
//         queryArray.push({
//             'mapData.address.country': {
//                 $regex: new RegExp(`^${JSON.parse(countries).join('$|^')}$`),
//                 $options: 'i',
//             },
//         });
//     }
//     if (states !== undefined) {
//         queryArray.push({
//             'mapData.address.state': {
//                 $regex: new RegExp(`^${JSON.parse(states).join('$|^')}$`),
//                 $options: 'i',
//             },
//         });
//     }
//     if (cities !== undefined) {
//         queryArray.push({
//             'mapData.address.city': {
//                 $regex: new RegExp(`^${JSON.parse(cities).join('$|^')}$`),
//                 $options: 'i',
//             },
//         });
//     }
//     // TODO
//     if (sort !== undefined) {
//     }
//     if (pickup !== undefined) {
//     }
//     if (delivery !== undefined) {
//     }
//     // add the array to the $and
//     const query =
//         queryArray.length > 0
//             ? {
//                   $and: queryArray,
//               }
//             : {};
//     console.log(query);
//     // Calculate number of documents to skip
//     pageSize = parseInt(req.query.pageSize);
//     pageNum = parseInt(req.query.pageNum);
//     const skips = pageSize * (pageNum - 1);

//     let resultCur = await collectionStores
//         .find(query)
//         .project(projectObjct)
//         .sort(sortObjct);
//     let totalQueryCount = await resultCur.count();
//     console.log(totalQueryCount);
//     let resultStores = await resultCur.skip(skips).limit(pageSize).toArray();

//     res.status(200).json({
//         success: true,
//         message: 'Filtered stores successfully fetched!',
//         totalCount: totalQueryCount,
//         stores: resultStores,
//         query: query,
//     });
//  }
