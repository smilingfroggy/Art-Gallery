'use strict';

//read excel file
const xlsx = require('xlsx')
const wb = xlsx.readFile('./seeders/seedsRawData.xlsx')
const subjects = wb.Sheets['subject']
const data = xlsx.utils.sheet_to_json(subjects)

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Subjects', data.map(subject => {
      return {
        name: subject.tagName,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Subjects', null, {})
  }
};
