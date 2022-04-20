'use strict';
let mediaData = ['水墨紙本', '設色紙本', '綜合媒材紙本', '膠彩絹本', '膠彩紙本', '油彩畫布', '水彩紙本', '青銅', '瓷', '銅', '木'] 

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Media', mediaData.map( medium => {
      return {
        name: medium,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Media', null, {})
  }
};
