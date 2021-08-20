// module.exports = (sequelize, Sequelize) => {
export { getProductModel };
function getProductModel(sequelize, Sequelize) {
    const Product = sequelize.define('product', {
        // storeId: {
        //     type: Sequelize.STRING(50),
        //     allowNull: false,
        // },

        title: {
            type: Sequelize.STRING(300),
            allowNull: false,
        },

        description: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        imgSrc: {
            type: Sequelize.STRING(10000),
            allowNull: false,
        },

        imageDetails: {
            type: Sequelize.STRING(1000),
            allowNull: false,
        },

        price: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        priceFloat: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },

        currency: {
            type: Sequelize.STRING(5),
            allowNull: false,
        },

        currencySymbol: {
            type: Sequelize.STRING(5),
            allowNull: false,
        },

        quantityType: {
            type: Sequelize.STRING(25),
            allowNull: false,
        },

        quantityValue: {
            type: Sequelize.STRING(25),
            allowNull: false,
        },

        delivery: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        pickup: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },

        stockAmount: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    });

    return Product;
}
