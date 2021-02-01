function removeDuplicatesFromArray(array) {
    return array.filter((value,index) => array.indexOf(value) === index);
};

//===========================================================================
export { removeDuplicatesFromArray }
//===========================================================================