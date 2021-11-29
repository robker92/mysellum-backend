export { getStoreImageModel, getNewStoreImageData };

function getStoreImageModel(sequelize, Sequelize) {
    const StoreImage = sequelize.define('storeImage', {
        type: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        arrayPosition: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },

        imgUrl: {
            type: Sequelize.STRING(10000),
            allowNull: false,
        },

        imgSrc: {
            type: Sequelize.STRING(10000),
            allowNull: false,
        },
    });
    return StoreImage;
}

function getNewStoreImageData(options) {
    const storeImage = {
        storeId: options.storeId,
        type: options.type,
        arrayPosition: options.arrayPosition,
        imgUrl: options.imgUrl,
        imgSrc: options.imgSrc,
    };
    return storeImage;
}
