export function getShoppingCartModel(options) {
    const model = {
        email: options.email,
        items: options.items, // : [[{product}, amount (int)],[{product}, amount (int)]]
    };
    return model;
}
