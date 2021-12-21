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
import { ObjectId } from 'mongodb';

import {
    fetchAndValidateStore,
    fetchAndValidateProduct,
} from '../../store-module/utils/operations/store-checks';

export {
    addToShoppingCartService,
    removeFromShoppingCartService,
    updateShoppingCartService,
    validateShoppingCartService,
    updateUsersShoppingCart,
};

async function addToShoppingCartService(email, addedProduct, addedAmount) {
    //Get the product from the database and save it in the shopping cart
    const store = await readOneOperation(databaseEntity.STORES, {
        _id: ObjectId(addedProduct.storeId),
    });
    if (!store) {
        //when no store was found -> wrong store id in the payload
        throw {
            status: 400,
            message: 'Wrong store id provided.',
        };
    }

    const productFromDB = await readOneOperation(databaseEntity.PRODUCTS, {
        _id: ObjectId(addedProduct._id),
    });
    if (!productFromDB) {
        //when no product was found -> wrong product id
        throw {
            status: 400,
            message: 'Wrong product id provided.',
        };
    }
    //delete the image to save localstorage space
    // delete productFromDB['imgSrc'];

    //Update the user's shopping cart
    const user = await readOneOperation(databaseEntity.USERS, {
        email: email,
    });
    if (!user) {
        //when no user was found -> wrong email
        throw {
            status: 400,
            message: 'Wrong email provided.',
        };
    }

    let currentShoppingCart = user.shoppingCart;
    //Check if product is already inside cart
    let found = false;
    if (currentShoppingCart.length > 0) {
        for (let i = 0; i < currentShoppingCart.length; i++) {
            //Check if added product is already in cart and increase amount if yes
            if (
                ObjectId(currentShoppingCart[i][0]._id).toString() ===
                    productFromDB._id.toString() &&
                currentShoppingCart[i][0].storeId === productFromDB.storeId
            ) {
                currentShoppingCart[i][1] =
                    currentShoppingCart[i][1] + addedAmount;
                // replace the current product in the cart with the fetched product from the database
                // (in case there were some data changes with the product in the meantime)
                currentShoppingCart[i].splice(0, 1, productFromDB);
                found = true;
                break;
            }
        }
    }
    // add product to cart if it is not already in there
    if (found === false) {
        currentShoppingCart.push([productFromDB, addedAmount]);
    }

    await updateOneOperation(
        databaseEntity.USERS,
        {
            email: email,
        },
        {
            shoppingCart: currentShoppingCart,
        },
        'set'
    );

    return currentShoppingCart;
}

async function removeFromShoppingCartService(
    email,
    removedProduct,
    removedAmount
) {
    // Get the product from the database and save it in the shopping cart
    const store = await readOneOperation(databaseEntity.STORES, {
        _id: ObjectId(removedProduct.storeId),
    });
    if (!store) {
        // when no store was found -> wrong store id in the payload
        throw {
            status: 400,
            message: 'Wrong store id provided.',
        };
    }
    // retrieve the product
    const productFromDB = await readOneOperation(databaseEntity.PRODUCTS, {
        _id: ObjectId(removedProduct._id),
    });
    if (!productFromDB) {
        // when no product was found -> wrong product id
        throw {
            status: 400,
            message: 'Wrong product id provided.',
        };
    }

    // delete the image to save localstorage space
    // delete productFromDB['imgSrc'];

    const user = await readOneOperation(databaseEntity.USERS, {
        email: email,
    });
    if (!user) {
        // when no user was found -> wrong email
        throw {
            status: 400,
            message: 'Wrong email provided.',
        };
    }
    let currentShoppingCart = user.shoppingCart;

    let found = false;
    for (let i = 0; i < currentShoppingCart.length; i++) {
        // Check if added product exists in cart
        if (
            currentShoppingCart[i][0]._id.toString() ===
                productFromDB._id.toString() &&
            currentShoppingCart[i][0].storeId === productFromDB.storeId
        ) {
            currentShoppingCart[i][1] =
                currentShoppingCart[i][1] - removedAmount;
            // replace the product with the fetched one
            currentShoppingCart[i].splice(0, 1, productFromDB);
            // Delete the array element if amount <= 0
            if (currentShoppingCart[i][1] <= 0) {
                currentShoppingCart.splice(i, 1);
            }
            found = true;
            break;
        }
    }
    if (found === false) {
        throw {
            status: 400,
            message: 'Product not found in shopping cart.',
        };
    }

    await updateOneOperation(
        databaseEntity.USERS,
        {
            email: email,
        },
        {
            shoppingCart: currentShoppingCart,
        },
        'set'
    );

    return currentShoppingCart;
}

async function updateShoppingCartService(email, shoppingCart) {
    let storeId;
    let productId;
    let payloadArray = [];
    // Run through the array, get every product from the database, push it to the payload array and save the cart to the user
    for (let i = 0; i < shoppingCart.length; i++) {
        storeId = shoppingCart[i][0].storeId;
        productId = shoppingCart[i][0]._id;

        const store = await readOneOperation(databaseEntity.STORES, {
            _id: ObjectId(storeId),
        });
        if (!store) {
            // when no store was found -> wrong store id in the payload
            return next({
                status: 400,
                message: 'Wrong store id provided.',
            });
        }

        // retrieve the product
        const productFromDB = await readOneOperation(databaseEntity.PRODUCTS, {
            _id: ObjectId(productId),
        });
        if (!productFromDB) {
            // when no product was found -> wrong product id
            throw {
                status: 400,
                message: 'Wrong product id provided.',
            };
        }

        // delete the image to save localstorage space
        // delete productFromDB['imgSrc'];
        payloadArray.push([productFromDB, shoppingCart[i][1]]);
    }

    // save shopping cart to user
    await updateOneOperation(
        databaseEntity.USERS,
        {
            email: email,
        },
        {
            shoppingCart: payloadArray,
        },
        'set'
    );

    return;
}

async function validateShoppingCartService(shoppingCart) {
    const productsToRemove = await identifyProducts(shoppingCart);
    const shoppingCartCopy = JSON.parse(JSON.stringify(shoppingCart));
    const updatedShoppingCart = removeProducts(
        shoppingCartCopy,
        productsToRemove
    );

    return updatedShoppingCart;
}

async function identifyProducts(shoppingCart) {
    let productsToRemove = [];
    for (var i = 0; i < shoppingCart.length; i++) {
        try {
            await fetchAndValidateProduct(shoppingCart[i][0]._id);
        } catch (error) {
            // add index of product to remove to array
            productsToRemove.push(i);
            continue;
        }
    }
    // console.log(productsToRemove);
    return productsToRemove;
}

function removeProducts(shoppingCart, productsToRemove) {
    for (const index of productsToRemove) {
        console.log(index);
        shoppingCart.splice(index, 1);
    }
    // console.log(shoppingCart);
    return shoppingCart;
}

async function updateUsersShoppingCart(email, shoppingCart) {
    console.log(`Email: ${email}`);
    console.log(shoppingCart.length);
    await updateOneOperation(
        databaseEntity.USERS,
        { email: email },
        { shoppingCart: shoppingCart }
    );

    return;
}
