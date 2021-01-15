function getMailContent(options) {
    let htmlBody =
        `<b>Hello User</b><br/> <br/> 
    we wanted to inform you that the product ${options.productId} from the store ${options.storeId}. 
    Please follow this link: <a href="http://127.0.0.1:8080/en/store-profile/${options.storeId}">Store</a><br/> 
    <img src="${options.imgSrc}" alt="Test">`;
    return htmlBody;
};

let subject = "Product Notification";

module.exports = {
    getMailContent,
    subject
};