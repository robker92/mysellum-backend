// module.exports = (sequelize, Sequelize) => {
export { getReviewModel };
function getReviewModel(sequelize, Sequelize) {
    const Review = sequelize.define('review', {
        // reviewId: {
        //     type: Sequelize.STRING(50),
        //     allowNull: false,
        // },

        userEmail: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        userFirstName: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        userLastName: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        userName: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },

        // userId: {
        //     type: Sequelize.STRING(50),
        //     allowNull: true,
        // },

        rating: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },

        text: {
            type: Sequelize.STRING(2000),
            allowNull: false,
        },
    });
    return Review;
}
