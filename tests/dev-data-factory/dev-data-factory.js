import axios from 'axios';

import {
    getMongoStoresCollection,
    getMongoUsersCollection,
    getMongoProductsCollection
} from '../mongodb/collections';

import storeData from './dev-data'

const ownApiClient = axios.create({
    baseURL: "",
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 20000,
    withCredentials: true
});

const reviewText = "Fazit: mein Geschmack ist es nicht, aber jeder Mensch hat einen anderen Geschmackssinn, deshalb kann man meine geschmackliche Bewetung nicht für andere kauf Interesenten verwenden :) Ansonsten entspricht alles was in der Beschreibung steht zum Produkt."

export const createFakeData = async function (req, res, next) {
    //await deleteAllData();
    await createFakeUserData();
    //await createFakeStoreData();
}

async function createFakeUserData(){
    console.log("registration:");
    //create the users
    for (let i = 0; i < storeData.users.length; i++) {
        await ownApiClient.post("http://localhost:3000/users/registerUser", storeData.users[i])
    }
    //verify them
    const collectionUsers = await getMongoUsersCollection();
    const users = await collectionUsers.find({}).toArray();
    console.log("verification:");
    //users.length
    for (let i = 0; i < 6; i++) {
        await ownApiClient.post(`http://localhost:3000/users/verifyRegistration/${users[i].verifyRegistrationToken}`);
    }
};

async function createFakeStoreData(){
    const collectionUsers = await getMongoUsersCollection();
    const collectionStores = await getMongoStoresCollection();
    //Login all users to get the jwt tokens
    let jwtTokenArray = [];
    console.log("login:");
    const users = await collectionUsers.find({}).toArray();
    for (let i = 0; i < 6; i++) {
        let payload = {
            email: users[i].email,
            password: "TestPassword1!"
        }
        let result = await ownApiClient.post(`http://localhost:3000/users/loginUser`, payload);
        let cookieString = result.headers['set-cookie'][0];
        console.log(cookieString.slice(10, cookieString.indexOf(";")));
        jwtTokenArray.push(cookieString.slice(10, cookieString.indexOf(";")));
    }
    
    // const collectionProducts = await getMongoProductsCollection();

    // const tokens = [
    //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYzNjMDEyZDRlZmY3MWIzY2ZhNmE1ZCIsImVtYWlsIjoiVGVzdEVtYWlsMTVAd2ViLmRlIiwiaWF0IjoxNjEyMzkwODk4LCJleHAiOjE2MTI5OTU2OTh9.ZmW3ZjrIGHXLp8b3oAug4OO4lKTENn7VSDQAwkJuMFM",
    //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlYTQ5NmQxN2VjNWEzMTdjNGJlMjg4NSIsImVtYWlsIjoiVGVzdEVtYWlsMjJAd2ViLmRlIiwiaWF0IjoxNjEyMzkxMDgxLCJleHAiOjE2MTI5OTU4ODF9.UBOBqhYxJVa8LaC0GJLSkVaqN_xBFl2E0Af9cpWi2j8",
    //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwMDBiZDQ2ZDZiMzgyNTQzMGQ3MDgzMiIsImVtYWlsIjoiVGVzdEVtYWlsNTU1QHdlYi5kZSIsImlhdCI6MTYxMjM5MTExOCwiZXhwIjoxNjEyOTk1OTE4fQ.ep6b2HpnnIfQKFt_HBRkh51VLS_lfbdVP69mulTsFHA",
    //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMDczMTA2YjRhZmM5NjNjMGM5MjVkYiIsImVtYWlsIjoiVGVzdEVtYWlsMTRAd2ViLmRlIiwiaWF0IjoxNjEyMzkxMTU2LCJleHAiOjE2MTI5OTU5NTZ9.OTBCz_wANLd8_f0CzQXOu6Eo32i_0NOqge696nGXmmg"
    // ];
    console.log("store creation:");
    for (let i = 0; i < storeData.stores.length; i++) {
        console.log(jwtTokenArray[i]);
        //console.log(storeData.stores[i])
        await ownApiClient.post("http://localhost:3000/stores/store", storeData.stores[i], {
            headers: {'x-access-token': jwtTokenArray[i]}
        })
    }

    console.log("review creation: ");
    let createdStores = await collectionStores.find({}).toArray();
    for (let i = 0; i < createdStores.length; i++) {
        
        await ownApiClient.post(`http://localhost:3000/stores/addReview/${createdStores[i]._id}`, 
        {
            "rating": "3",
            "text": reviewText
        }, {
            headers: {'x-access-token': jwtTokenArray[4]
        }})
    }
}


export const createFakeDataEndpoint = async function (req, res, next) {
    await deleteAllData();

    res.status(200).send("ok")
}
async function deleteAllData(){
    const collectionStores = await getMongoStoresCollection();
    const collectionUsers = await getMongoUsersCollection();
    const collectionProducts = await getMongoProductsCollection();

    await  collectionUsers.deleteMany({});
    await  collectionStores.deleteMany({});
    await  collectionProducts.deleteMany({});
}