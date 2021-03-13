export {
    checkProfileComplete,
    checkMinOneProduct,
    checkShippingRegistered,
    checkPaymentMethodRegistered,
}

function checkProfileComplete(title, description, tags, images) {
    if (profileData.title.length < 10 || profileData.title.length > 100) {
        return false
    }

    if (
        profileData.description.length < 100 ||
        profileData.description.length > 1000
    ) {
        return false
    }

    if (profileData.tags.length < 1 || profileData.tags.length > 15) {
        return false
    }

    if (profileData.images.length < 1 || profileData.images.length > 10) {
        return false
    }

    return true
}

function checkMinOneProduct(products) {
    if (products.length === 0) {
        return false
    }
    return true
}

function checkShippingRegistered() {
    return true
}

function checkPaymentMethodRegistered() {
    return true
}
