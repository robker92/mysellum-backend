import { ObjectId } from 'mongodb';
import {
    getMongoStoresCollection,
    getMongoProductsCollection
} from '../../mongodb/collections';


async function checkActivationSteps(store) {
    const collectionStores = await getMongoStoresCollection();

    
    //check profile completion: title, description, tags, image
    //check if at least one product is added to the store
    //check if the store added shipping information
    //check if the store added a payment method
    let activationValue = true;
    const checkOneProdut = await checkMinOneProduct;
    if(checkProfileCompletion(store) === false || checkOneProdut === false) {
        //set activation to false
        activationValue = false;
    };
    //set activation value
    let responseStore = await collectionStores.updateOne({
        "_id": ObjectId(store._id)
    }, {
        $set: {
            "activation": activationValue
        }
    });

    if(!responseStore){
        //error while updating
    }
}

function checkProfileCompletion(store){
    //TODO
    if(store.title.length > 0 && store.description.length > 0 && store.tags.length > 0 && store.images > 0 ) {
        return true;
    }
    return false;
}

async function checkMinOneProduct(store){
    const collectionProducts = await getMongoProductsCollection();

    let resultProducts = await getMongoProductsCollection.find({
        "storeId": store._id
    }).toArray();

    if(resultProducts) {
        return true;
    };
    return false;
}

function checkShippingRegistered(store){
}

function checkPaymentMethodRegistered(store){
}

function setActivation(){}

//===============================================================================
export { checkActivationSteps }
//===============================================================================