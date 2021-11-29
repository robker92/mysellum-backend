// module.exports = (sequelize, Sequelize) => {
export { getProductAvailNotifModel };
function getProductAvailNotifModel(sequelize, Sequelize) {
    const Product = sequelize.define('productAvailNotif', {
        email: {
            type: Sequelize.STRING(300),
            allowNull: false,
        },
    });

    return Product;
}
