'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER DATABASE ${queryInterface.sequelize.config.database}
        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    )
  },
  async down(queryInterface, Sequelize) { }
};