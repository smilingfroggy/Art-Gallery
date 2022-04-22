'use strict';
const xlsx = require('xlsx')

// read excel file
const wb = xlsx.readFile('./seeders/seedsRawData.xlsx', { cellDates: true })
const exhibitions = wb.Sheets['exhibition']
const data = xlsx.utils.sheet_to_json(exhibitions) 

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Exhibitions', data.map(exhibition => {
      return {
        ...exhibition,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Exhibitions', null, {})
  }
};
