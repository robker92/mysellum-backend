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
    // Get the product from the database and save it in the shopping cart
    const store = await readOneOperation(databaseEntity.STORES, {
        _id: addedProduct.storeId,
    });
    if (!store) {
        // when no store was found -> wrong store id in the payload
        throw new Error(`The store id ${addedProduct.storeId} is invalid.`);
    }

    const productFromDb = await readOneOperation(
        databaseEntity.PRODUCTS,
        {
            _id: addedProduct._id,
        },
        {
            stockAmount: 0,
            quantityType: 0,
            quantityValue: 0,
            imageDetails: 0,
            datetimeCreated: 0,
            datetimeAdjusted: 0,
        }
    );
    if (!productFromDb) {
        // when no product was found -> wrong product id
        throw new Error(`The product id ${addedProduct._id} is invalid.`);
    }

    // Get current Cart
    const cartFromDb = await readOneOperation(databaseEntity.SHOPPING_CARTS, {
        email: email,
    });
    if (!cartFromDb) {
        // when no cart was found -> wrong email -> Need to create cart at same time user is created
        throw new Error(`No shopping cart could be found.`);
    }

    let currentShoppingCart = cartFromDb.items;

    // check whether there are more than 10 items from 10 different stores inside the cart
    let storeIds = [];
    for (const element of currentShoppingCart) {
        storeIds.push(element[0].storeId);
    }
    if (storeIds.length >= 10) {
        throw new Error(
            `No more than 10 items of 10 different stores can be placed in a cart.`
        );
    }

    // Check if product is already inside cart
    let found = false;
    if (currentShoppingCart.length > 0) {
        for (const element of currentShoppingCart) {
            // product = element[0];
            // amount = element[1];

            // Check if added product is already in cart and increase amount if yes
            if (
                ObjectId(element[0]._id).toString() ===
                    productFromDb._id.toString() &&
                element[0].storeId === productFromDb.storeId
            ) {
                element[1] = element[1] + addedAmount;
                // replace the current product in the cart with the fetched product from the database
                // (in case there were some data changes with the product in the meantime)
                element.splice(0, 1, productFromDb);
                found = true;
                break;
            }
        }
    }

    // add product to cart if it is not already in there
    if (found === false) {
        currentShoppingCart.push([productFromDb, addedAmount]);
    }

    await updateOneOperation(
        databaseEntity.SHOPPING_CARTS,
        {
            email: email,
        },
        {
            items: currentShoppingCart,
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
    // validate the store id
    const store = await readOneOperation(databaseEntity.STORES, {
        _id: removedProduct.storeId,
    });
    if (!store) {
        // when no store was found -> wrong store id in the payload
        throw new Error(`The store id ${addedProduct.storeId} is invalid.`);
    }

    // validate and get the product
    const productFromDb = await readOneOperation(
        databaseEntity.PRODUCTS,
        {
            _id: removedProduct._id,
        },
        {
            stockAmount: 0,
            quantityType: 0,
            quantityValue: 0,
            imageDetails: 0,
            datetimeCreated: 0,
            datetimeAdjusted: 0,
        }
    );
    if (!productFromDb) {
        // when no product was found -> wrong product id
        throw new Error(`The product id ${addedProduct._id} is invalid.`);
    }

    // validate and get current cart
    const cartFromDb = await readOneOperation(databaseEntity.SHOPPING_CARTS, {
        email: email,
    });
    if (!cartFromDb) {
        // when no cart was found -> wrong email
        throw new Error(`No shopping cart could be found.`);
    }
    let currentShoppingCart = cartFromDb.items;

    let found = false;
    for (const element of currentShoppingCart) {
        // product = element[0];
        // amount = element[1];

        // Check if added product exists in cart
        if (
            element[0]._id.toString() === productFromDb._id.toString() &&
            element[0].storeId === productFromDb.storeId
        ) {
            element[1] = element[1] - removedAmount;
            // replace the product with the fetched one
            element.splice(0, 1, productFromDb);
            // Delete the array element if amount <= 0
            if (element[1] <= 0) {
                currentShoppingCart.splice(i, 1);
            }
            found = true;
            break;
        }
    }

    if (found === false) {
        throw new Error(
            `The product could not be found in the shopping cart. It needs to be added first.`
        );
    }

    await updateOneOperation(
        databaseEntity.SHOPPING_CARTS,
        {
            email: email,
        },
        {
            items: currentShoppingCart,
        },
        'set'
    );

    return currentShoppingCart;
}

async function updateShoppingCartService(email, shoppingCart) {
    let storeId;
    let productId;
    let resultShoppingCart = [];
    // Run through the array, get every product from the database, push it to the payload array and save the cart to the user
    for (const element of shoppingCart) {
        storeId = element[0].storeId;
        productId = element[0]._id;

        const store = await readOneOperation(databaseEntity.STORES, {
            _id: storeId,
        });
        if (!store) {
            // when no store was found -> wrong store id in the payload
            throw new Error(`The store id ${storeId} is invalid.`);
        }

        // retrieve the product
        const productFromDb = await readOneOperation(
            databaseEntity.PRODUCTS,
            {
                _id: productId,
            },
            {
                stockAmount: 0,
                quantityType: 0,
                quantityValue: 0,
                imageDetails: 0,
                datetimeCreated: 0,
                datetimeAdjusted: 0,
            }
        );
        if (!productFromDb) {
            // when no product was found -> wrong product id
            throw new Error(`The product id ${productId} is invalid.`);
        }

        resultShoppingCart.push([productFromDb, element[1]]);
    }

    // save shopping cart to user
    await updateOneOperation(
        databaseEntity.SHOPPING_CARTS,
        {
            email: email,
        },
        {
            items: resultShoppingCart,
        },
        'set'
    );

    return;
}

/**
 * The function iterates over the provided shopping cart and checks if the contained products do still exist.
 * If they do not, they will be removed from the cart. Otherwise it would lead to errors and inconsistencies.
 * @param {string} email
 * @param {Array} shoppingCart
 * @returns
 */
async function validateShoppingCartService(email, shoppingCart) {
    const productsToRemove = await identifyProducts(shoppingCart);
    const updatedShoppingCart = removeProducts(shoppingCart, productsToRemove);

    if (JSON.stringify(updatedShoppingCart) !== JSON.stringify(shoppingCart)) {
        await updateUsersShoppingCart(email, updatedShoppingCart);
    }
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

    return productsToRemove;
}

function removeProducts(shoppingCart, productsToRemove) {
    for (const index of productsToRemove) {
        shoppingCart.splice(index, 1);
    }

    return shoppingCart;
}

async function updateUsersShoppingCart(email, shoppingCart) {
    await updateOneOperation(
        databaseEntity.USERS,
        { email: email },
        { shoppingCart: shoppingCart }
    );

    return;
}

async function getShoppingCartService(email) {
    const shoppingCart = await readOneOperation(databaseEntity.SHOPPING_CARTS, {
        email: email,
    });

    if (!shoppingCart) {
        throw new Error(
            `No shopping cart found for the user with the email ${email}.`
        );
    }

    return shoppingCart.items;
}
