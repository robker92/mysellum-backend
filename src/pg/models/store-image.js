// module.exports = (sequelize, Sequelize) => {
export { getStoreImageModel };
function getStoreImageModel(sequelize, Sequelize) {
    const StoreImage = sequelize.define('storeImage', {
        // storeId: {
        //     type: Sequelize.STRING(50),
        //     allowNull: false,
        // },

        arrayPosition: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },

        imgSrc: {
            type: Sequelize.STRING(10000),
            allowNull: false,
        },
    });
    return StoreImage;
}
