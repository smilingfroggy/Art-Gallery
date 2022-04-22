'use strict';

const xlsx = require('xlsx')
const wb = xlsx.readFile('./seeders/seedsRawData.xlsx')
const exhibitionArtworks = wb.Sheets['exhibitionartwork']
const data = xlsx.utils.sheet_to_json(exhibitionArtworks)

module.exports = {
  async up(queryInterface, Sequelize) {
    // query existed id of exhibitions and artworks table
    const exhibitions = await queryInterface.sequelize.query('SELECT id, name FROM Exhibitions', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    })
    const artworks = await queryInterface.sequelize.query('SELECT id, serialNumber from Artworks', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    })
    /** exhibitions = [
      *   { id: 1, name: '台展三少年-林玉山 陳進 郭雪湖 聯展' },
      *   { id: 2, name: '風采人間－台灣鄉土人文誌' },
      *   { id: 3, name: '臺靜農逝世三十週年紀念展' }
      * ] 
    */
    await queryInterface.bulkInsert('Exhibitionartworks', data.map(work => {
      let exhibitionId = exhibitions.find(exh => exh.name === work.Exhibition).id
      let artworkId = artworks.find(artwork => artwork.serialNumber === work['Artwork-serialNumber']).id
      // console.log(work.Exhibition, 'Exh-id: ', exhibitionId, 'Work-id: ', artworkId)

      return {
        ExhibitionId: exhibitionId,
        ArtworkId: artworkId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Exhibitionartworks', null, {})
  }
};
