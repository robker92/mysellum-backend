export {
    checkProfileComplete,
    checkMinOneProduct,
    checkShippingRegistered,
    checkPaymentMethodRegistered,
};

function checkProfileComplete(title, description, tags, images) {
    if (title.length < 10 || title.length > 100) {
        return false;
    }

    if (description.length < 100 || description.length > 1000) {
        return false;
    }

    if (tags.length < 1 || tags.length > 15) {
        return false;
    }

    if (images.length < 1 || images.length > 10) {
        return false;
    }

    return true;
}

function checkMinOneProduct(products) {
    if (products.length === 0) {
        return false;
    }
    return true;
}

function checkShippingRegistered() {
    return true;
}

function checkPaymentMethodRegistered() {
    return true;
}
