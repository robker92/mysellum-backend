function getContentOrderStatusInDelivery(options) {
    let htmlBody = `<b>Hello User</b><br/> <br/> 
    we wanted to inform you that your order with the id ${options.orderId} is in delivery now.`;
    return htmlBody;
}

const subjectOrderStatusInDelivery = 'Your order is in delivery!';

//===================================================================================================
export { getContentOrderStatusInDelivery, subjectOrderStatusInDelivery };
//===================================================================================================
