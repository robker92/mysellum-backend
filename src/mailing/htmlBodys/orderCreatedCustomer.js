function getContentOrderCreatedCustomer(options) {
    let htmlBody = `<b>Hello Customer</b><br/> <br/> 
    thank you for your order! It will be transfered to the store.`;
    return htmlBody;
}

const subjectOrderCreatedCustomer = 'Order confirmation';

//===================================================================================================
export { getContentOrderCreatedCustomer, subjectOrderCreatedCustomer };
//===================================================================================================
