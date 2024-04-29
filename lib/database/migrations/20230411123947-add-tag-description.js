'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.addColumn('tags', 'description', {
            allowNull: true,
            type: Sequelize.TEXT,
        });
    },
    down: async (queryInterface) => {
        return queryInterface.removeColumn('tags', 'description');
    },
};
