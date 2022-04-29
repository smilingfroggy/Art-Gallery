'use strict';
const { faker } = require('@faker-js/faker')

//read excel file
const xlsx = require('xlsx')
const wb = xlsx.readFile('./seeders/seedsRawData.xlsx')
const artwork = wb.Sheets['artwork']
const rawData = xlsx.utils.sheet_to_json(artwork)

module.exports = {
  async up(queryInterface, Sequelize) {
    // query existed artwork id
    const artworks = await queryInterface.sequelize.query('SELECT id, serialNumber FROM Artworks', { type: queryInterface.sequelize.QueryTypes.SELECT })
    // [{ id: 1, serialNumber: '00000157' }, ..]

    await queryInterface.bulkInsert('ArtworkImages', rawData.map(work => {
      return {
        ArtworkId: artworks.find(artwork_db => { return artwork_db.serialNumber == work.serialNumber }).id,
        type: 'original',
        description: faker.lorem.sentence(),
        url: work.url,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }), {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ArtworkImages', null, {})
  }
};
