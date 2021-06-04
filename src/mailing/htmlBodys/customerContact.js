function getContentCustomerContact(options) {
    let htmlBody = `<b>A Customer requested to get in contact with us</b><br/> <br/> 
    the customer's email address: ${options.userEmail} <br/> <br/> 
    the subject: ${options.subject} <br/> <br/> 
    the message: ${options.message} <br/> <br/> <br/>  <br/> 
    
    Your Email Servuice <br/> `;
    return htmlBody;
}

const subjectCustomerContact = 'Customer send contact mail';

//===================================================================================================
export { getContentCustomerContact, subjectCustomerContact };
//===================================================================================================
