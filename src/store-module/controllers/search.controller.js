'use strict';
import { StatusCodes } from 'http-status-codes';
import {
    getFilteredStoresService,
    getFilteredStores2Service,
} from '../services/search.service';
import { getMongoStoresCollection } from '../../storage/mongodb/collections';

export {
    // getFilteredStores,
    // getFilteredStores2,
    getStoresDelivery,
    getStoresByLocation,
};

// const getFilteredStores = async function (req, res, next) {
//     const searchTerm = req.params.searchterm;

//     let result;
//     try {
//         result = await getFilteredStoresService(searchTerm);
//     } catch (error) {
//         return next(error);
//     }

//     return res.status(StatusCodes.OK).json({
//         stores: result,
//     });
// };

// const getFilteredStores2 = async function (req, res, next) {
//     const filterObject = req.body;

//     let result;
//     try {
//         result = await getFilteredStores2Service(filterObject);
//     } catch (error) {
//         return next(error);
//     }

//     return res.status(StatusCodes.OK).json({
//         stores: result,
//     });
// };

/**
 * Search Delivery
 * - term search in title, description and tags
 * - country, state, city
 * - sort
 * - pagination
 */
const getStoresDelivery = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();

    let {
        searchTerm,
        countries,
        states,
        cities,
        sort,
        pickup,
        delivery,
        pageSize,
        pageNum,
    } = req.query;
    console.log(JSON.stringify(req.query));

    //Build search query
    let queryArray = []; // will be added to the $and
    let projectObject = {}; // projection object
    let sortObject = {};
    if (searchTerm !== undefined) {
        // queryArray.push(
        //     //Search in indexed texts (title, description, tags)
        //     {
        //         $text: {
        //             $search: searchTerm,
        //             $caseSensitive: false,
        //         },
        //     }
        // );
        queryArray.push(getSearchObject(searchTerm));
    }

    //TODO - check if inputs are in list of possible values
    if (countries !== undefined) {
        queryArray.push({
            'mapData.address.country': {
                $regex: new RegExp(`^${JSON.parse(countries).join('$|^')}$`),
                $options: 'i',
            },
        });
    }
    if (states !== undefined) {
        queryArray.push({
            'mapData.address.state': {
                $regex: new RegExp(`^${JSON.parse(states).join('$|^')}$`),
                $options: 'i',
            },
        });
    }
    if (cities !== undefined) {
        queryArray.push({
            'mapData.address.city': {
                $regex: new RegExp(`^${JSON.parse(cities).join('$|^')}$`),
                $options: 'i',
            },
        });
    }

    //TODO
    if (sort !== undefined) {
    }

    // distribution object
    queryArray = getDistributionObject(queryArray, pickup, delivery);
    // admin options
    queryArray = getAdminOptions(queryArray);

    //add the array to the $and operator
    const query =
        queryArray.length > 0
            ? {
                  $and: queryArray,
              }
            : {};
    console.log(JSON.stringify(query));

    let resultCursor = await collectionStores
        .find(query)
        .project(projectObject)
        .sort(sortObject);
    const totalQueryCount = await resultCursor.count();
    console.log(totalQueryCount);

    // Calculate number of documents to skip
    pageSize = parseInt(pageSize);
    pageNum = parseInt(pageNum);
    const skips = pageSize * (pageNum - 1);
    let resultStores = await resultCursor.skip(skips).limit(pageSize).toArray();

    return res.status(StatusCodes.OK).json({
        totalCount: totalQueryCount,
        stores: resultStores,
        // query: query,
    });
};

function getDistributionObject(queryArray, pickup, delivery) {
    pickup = pickup === 'true';
    delivery = delivery === 'true';
    const query = {
        $or: [
            {
                pickup: pickup,
            },
            {
                delivery: delivery,
            },
        ],
    };
    queryArray.push(query);
    return queryArray;
}

function getAdminOptions(queryArray) {
    // check if store activated
    queryArray.push({
        activation: true,
    });
    // check if store is not deleted
    queryArray.push({
        deleted: false,
    });
    // check if admin activation is true
    queryArray.push({
        adminActivation: true,
    });
    return queryArray;
}

function getSearchObject(searchTerm) {
    let queryArray = [];

    queryArray.push({
        'profileData.title': {
            $regex: searchTerm,
            $options: 'i',
        },
    });
    queryArray.push({
        'profileData.description': {
            $regex: searchTerm,
            $options: 'i',
        },
    });
    queryArray.push({
        'profileData.tags': {
            $regex: searchTerm,
            $options: 'i',
        },
    });

    const query = {
        $or: queryArray,
    };
    return query;
}

/**
 * Search By Location (pickup)
 * min lat/lng, max lat/lng
 */
const getStoresByLocation = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();

    const {
        searchTerm,
        pickup,
        delivery,
        // pageSize, pageNum
    } = req.query;
    console.log(JSON.stringify(req.query));

    const filterObject = req.body;
    const min_lat = parseFloat(req.params.min_lat);
    const max_lat = parseFloat(req.params.max_lat);
    const min_lng = parseFloat(req.params.min_lng);
    const max_lng = parseFloat(req.params.max_lng);

    //thorw//mysellum//comema//lomabay//syloma//malomy
    // provided filter object
    console.log(filterObject);
    // let queryFilter = {};
    let queryArray = [];
    let projectObject = {};
    let sortObject = {};

    // if (searchTerm !== undefined) {
    //     queryArray.push(
    //         //Search in indexed texts (title, description, tags)
    //         {
    //             $text: {
    //                 $search: searchTerm,
    //                 $caseSensitive: false,
    //             },
    //         }
    //     );
    // }
    if (searchTerm !== undefined) {
        queryArray.push(getSearchObject(searchTerm));
    }

    //Query: gte: greater than or equal; lte: less than or equal; value in an array: { $in: [ 5, 15 ] }
    //Get stores whose lat is >
    console.log(`lat min: ${min_lat}; lat max: ${max_lat}`);
    console.log(`lng min: ${min_lng}; lng max: ${max_lng}`);

    const latQueryObject = {
        'mapData.location.lat': {
            $gte: min_lat,
            $lte: max_lat,
        },
    };
    queryArray.push(latQueryObject);

    const lngQueryObject = {
        'mapData.location.lng': {
            $gte: min_lng,
            $lte: max_lng,
        },
    };
    queryArray.push(lngQueryObject);

    // distribution object
    queryArray = getDistributionObject(queryArray, pickup, delivery);
    // admin options
    queryArray = getAdminOptions(queryArray);

    //add the array to the $and operator
    const query =
        queryArray.length > 0
            ? {
                  $and: queryArray,
              }
            : {};
    console.log(JSON.stringify(query));
    let resultCursor = await collectionStores
        .find(query)
        .project(projectObject)
        .sort(sortObject);
    let totalQueryCount = await resultCursor.count();
    console.log(totalQueryCount);
    let resultStores = await resultCursor
        // .skip(skips)
        // .limit(pageSize)
        .toArray();

    //console.log(fetchResult[0].mapData.location)

    return res.status(StatusCodes.OK).json({
        stores: resultStores,
        totalQueryCount: totalQueryCount,
    });
};
