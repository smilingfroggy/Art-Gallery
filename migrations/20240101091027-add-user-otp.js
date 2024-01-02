'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'otp', { type: Sequelize.STRING })
    await queryInterface.addColumn('Users', 'expiredAt', { type: Sequelize.DATE })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'otp')
    await queryInterface.removeColumn('Users', 'expiredAt')
  }
};
