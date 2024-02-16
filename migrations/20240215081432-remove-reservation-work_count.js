'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reservations', 'work_count')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Reservations', 'work_count', { type: Sequelize.INTEGER })
  }
};