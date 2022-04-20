'use strict';
const xlsx = require('xlsx')
const fs = require('fs')

// read excel file
const wb = xlsx.readFile('./seeders/artistSeeds.xlsx')
const artists = wb.Sheets['artist']
const data = xlsx.utils.sheet_to_json(artists)  // [ {name:, otherName:..}, {}, {}...]


module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Artists', data.map( artist => {
      return {
        ...artist,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Artists')
  }
};
