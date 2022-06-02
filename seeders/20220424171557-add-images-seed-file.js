'use strict';

//read excel file
const xlsx = require('xlsx');
const wb = xlsx.readFile('./seeders/seedsRawData.xlsx')
const exhibitionImage = wb.Sheets['exhibitionImage']
const rawData_exhibitionImage = xlsx.utils.sheet_to_json(exhibitionImage)
const artistImage = wb.Sheets['artistImage']
const rawData_artistImage = xlsx.utils.sheet_to_json(artistImage)

module.exports = {
  async up (queryInterface, Sequelize) {
    // query exhibition id
    const db_exhibitions = await queryInterface.sequelize.query('SELECT id, name FROM exhibitions', { type: queryInterface.sequelize.QueryTypes.SELECT })
    const db_artists = await queryInterface.sequelize.query('SELECT id, name FROM artists', { type: queryInterface.sequelize.QueryTypes.SELECT })

    await queryInterface.bulkInsert('ExhibitionImages', rawData_exhibitionImage.map( image => {
      return {
        ExhibitionId: db_exhibitions.find(exhibition => exhibition.name === image.exhibition).id,
        url: image.url,
        type: image.type,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
    await queryInterface.bulkInsert('ArtistImages', rawData_artistImage.map( image => {
      return {
        ArtistId: db_artists.find( artist => artist.name === image.artistName).id,
        url: image.url,
        type: image.type,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ExhibitionImages', null, {})
    await queryInterface.bulkDelete('ArtistImages', null, {})
  }
};
