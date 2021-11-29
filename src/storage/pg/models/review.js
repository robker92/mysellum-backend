export { getReviewModel, getNewReviewData };

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

function getNewReviewData(options) {
    const review = {
        userEmail: options.userEmail,
        userFirstName: options.userFirstName,
        userLastName: options.userLastName,
        userName: options.userLastName + ', ' + options.userFirstName,
        rating: options.rating,
        text: options.text,
    };
    return review;
}
