function getContentOrderCreatedStore(options) {
    let htmlBody = `<b>Hello Store Owner</b><br/> <br/> 
    congratulations! You received a new order.`;
    return htmlBody;
}

const subjectOrderCreatedStore = 'You received an order!';

//===================================================================================================
export { getContentOrderCreatedStore, subjectOrderCreatedStore };
//===================================================================================================
