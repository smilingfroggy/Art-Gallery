'use strict';

//read excel file
const xlsx = require('xlsx')
const wb = xlsx.readFile('./seeders/seedsRawData.xlsx')
const artwork = wb.Sheets['artwork']
const rawData = xlsx.utils.sheet_to_json(artwork)

module.exports = {
  async up (queryInterface, Sequelize) {
    // query existed artist id and artwork id
    const artists = await queryInterface.sequelize.query('SELECT id, name FROM Artists', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    })
    const artworks = await queryInterface.sequelize.query('SELECT id, serialNumber FROM Artworks', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    })
    // console.log('artists 1-5 :', artists.slice(0,5))
    // console.log('artworks 1-5 :', artworks.slice(0, 5))

    let records = []   // to bulk insert

    function createInsertData(artwork) {   //artwork from rawData
      let creators = artwork.artistName.split(' ')   // ex ['XXX'] or ['XXX', 'OOO']
      // console.log(creators)
      for (let i = 0; i < creators.length; i++) {
        records.push({
          ArtworkId: artworks.find(work => work.serialNumber === artwork.serialNumber).id,
          ArtistId: artists.find( artist => artist.name === creators[i]).id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        // console.log('pushed ', artwork.serialNumber, artwork.name)
      }
    }

    rawData.forEach(artwork => { createInsertData(artwork) })

    await queryInterface.bulkInsert('ArtworkArtists', records)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ArtworkArtists', null, {})
  }
};
