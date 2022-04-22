'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Artworks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      artistName: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      serialNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      creationTime: {
        type: Sequelize.DATE
      },
      creationTimeNote: {
        type: Sequelize.STRING
      },
      height: {
        type: Sequelize.FLOAT
      },
      width: {
        type: Sequelize.FLOAT
      },
      depth: {
        type: Sequelize.FLOAT
      },
      piecesNum: {
        type: Sequelize.INTEGER
      },
      introduction: {
        type: Sequelize.TEXT
      },
      viewCount: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Artworks');
  }
};