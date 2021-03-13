"use strict";

import {
    getMongoStoresCollection
} from '../../mongodb/collections';

const getFilteredStores = async function (req, res, next) {
    const collection = await getMongoStoresCollection();
    let searchTerm = req.params.searchterm;
    //var idArray = [];
    //var result = await collection.find().toArray();
    //db.stores.find({"profileData.tags":{$eq: "meat"}})
    let result = await collection.find({
        "profileData.tags": {
            $eq: searchTerm
        }
    }).toArray();
    console.log(result)

    // for (var i = 0; i < result.length; i++) {
    //     idArray.push(result[i]._id.toString())
    // }
    // console.log(idArray)
    //console.log(result)
    //res.status(200).send(result);
    res.status(200).json({
        success: true,
        message: 'Filtered stores successfully fetched!',
        stores: result,
        //idArray: idArray
    });
};


const getFilteredStores2 = async function (req, res, next) {
    const collection = await getMongoStoresCollection();
    console.log(req.body)
    let filterObject = req.body;
    console.log(filterObject)
    //Create filter query (like here https://docs.mongodb.com/manual/tutorial/query-arrays/)
    let queryFilter = {};
    for (let key in filterObject) {
        if (key === "tags") {
            if (filterObject[key].length === 0) {
                return next({
                    status: 400,
                    message: "Invalid filter provided."
                });
            }
            queryFilter[`profileData.${key}`] = {
                $all: filterObject[key] //matches all elements in array
            }
        }
        if (key === "country") {

        }
    }
    //If no valid key is provided
    if (queryFilter === {}) {
        //TODO No Filter provided
    }
    console.log(queryFilter)

    //Fetch filtered Stores
    let result = await collection.find(queryFilter).toArray();

    res.status(200).json({
        success: true,
        message: 'Filtered stores successfully fetched!',
        stores: result,
        //idArray: idArray
    });
};

/**
 * Search Delivery
 * - term search in title, description and tags
 * - country, state, city
 * - sort
 * - pagination
 */
const getStoresDelivery = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    //Search params, Sort params
    let {
        searchTerm,
        countries,
        states,
        cities,
        sort,
        pickup,
        delivery,
        pageSize,
        pageNum
    } = req.query;
    console.log(JSON.stringify(req.query));

    //Build search query
    let queryArray = [] //will be added to the $and
    let projectObjct = {}
    let sortObjct = {}
    if (searchTerm !== undefined) {
        queryArray.push(
            //Search in indexed texts (title, description, tags)
            {
                $text: {
                    $search: searchTerm,
                    $caseSensitive: false
                }
            }
        );
        // projectObjct["score"] = {
        //     $meta: "textScore"
        // };
        // sortObjct["score"] = {
        //     $meta: "textScore"
        // };
    }
    //TODO - check if inputs are in list of possible values
    if (countries !== undefined) {
        queryArray.push({
            "mapData.address.country": {
                $regex: new RegExp(`^${JSON.parse(countries).join("$|^")}$`),
                $options: 'i'
            }
        });
    };
    if (states !== undefined) {
        queryArray.push({
            "mapData.address.state": {
                $regex: new RegExp(`^${JSON.parse(states).join("$|^")}$`),
                $options: 'i'
            }
        });
    };
    if (cities !== undefined) {
        queryArray.push({
            "mapData.address.city": {
                $regex: new RegExp(`^${JSON.parse(cities).join("$|^")}$`),
                $options: 'i'
            }
        });
    }
    //TODO
    if (sort !== undefined) {};
    if (pickup !== undefined) {};
    if (delivery !== undefined) {};
    //add the array to the $and
    const query = queryArray.length > 0 ? {
        $and: queryArray
    } : {};
    console.log(query)
    // Calculate number of documents to skip
    pageSize = parseInt(req.query.pageSize);
    pageNum = parseInt(req.query.pageNum);
    const skips = pageSize * (pageNum - 1)


    let resultCur = await collectionStores.find(query).project(projectObjct).sort(sortObjct);
    let totalQueryCount = await resultCur.count();
    console.log(totalQueryCount)
    let resultStores = await resultCur.skip(skips).limit(pageSize).toArray();
    // let result = await collectionStores.aggregate([{
    //     "$facet": {
    //         "stores": [{
    //                 "$match": query
    //             },
    //             {
    //                 "$skip": skips
    //             },
    //             {
    //                 "$limit": pageSize
    //             }
    //         ],
    //         "totalCount": [{
    //             "$count": "count"
    //         }]
    //     }
    // }]).toArray();


    //console.log(result[0].profileData.tags)
    //console.log(result[0].totalCount[0].count)

    res.status(200).json({
        success: true,
        message: 'Filtered stores successfully fetched!',
        totalCount: totalQueryCount,
        stores: resultStores,
        query: query
    });
};

/**
 * Search By Location (pickup)
 * min lat/lng, max lat/lng
 */
const getStoresByLocation = async function (req, res, next) {
    const collectionStores = await getMongoStoresCollection();
    let min_lat = parseFloat(req.params.min_lat);
    let max_lat = parseFloat(req.params.max_lat);
    let min_lng = parseFloat(req.params.min_lng);
    let max_lng = parseFloat(req.params.max_lng);

    //Query: gte: greater than or equal; lte: less than or equal; value in an array: { $in: [ 5, 15 ] }
    //Get stores whose lat is >
    console.log(`lat min: ${min_lat}; lat max: ${max_lat}`)
    console.log(`lng min: ${min_lng}; lng max: ${max_lng}`)

    var fetchResult = await collectionStores.find({
        $and: [{
            "mapData.location.lat": {
                $gte: min_lat,
                $lte: max_lat
            },
            "mapData.location.lng": {
                $gte: min_lng,
                $lte: max_lng
            }
        }]
    }).limit(100).toArray();

    //console.log(fetchResult[0].mapData.location)

    res.status(200).json({
        success: true,
        message: 'Stores successfully fetched!',
        stores: fetchResult
    });
};

//===================================================================================================
export { getFilteredStores, getFilteredStores2, getStoresDelivery, getStoresByLocation };
//===================================================================================================