'use strict';

//read excel file
const xlsx = require('xlsx')
const wb = xlsx.readFile('./seeders/seedsRawData.xlsx')
const artwork = wb.Sheets['artwork']
const rawData = xlsx.utils.sheet_to_json(artwork)
console.log(rawData.slice(0, 3))
module.exports = {
  async up(queryInterface, Sequelize) {
    // query existed id from artworks and subjects table
    const artworks = await queryInterface.sequelize.query('SELECT id, serialNumber FROM Artworks', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    })
    const subjects = await queryInterface.sequelize.query('SELECT id, name FROM Subjects', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    })

    function createInsertData(artwork) {   //artwork from rawData
      let tags = artwork.subjects.split(" ")  // ex ['動物', '猛獸', '虎']
      let artworkSubjects = []
      for (let i = 0; i < tags.length; i++) {
        artworkSubjects.push({
          SubjectId: subjects.find(subject => subject.name === tags[i]).id,
          ArtworkId: artworks.find(work => work.serialNumber === artwork.serialNumber).id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      return artworkSubjects   // [{...}, {...}, {...}]
    }

    let records = []
    // records.push(...rawData.map(artwork => createInsertData(artwork)))  // [[{}, {}, {}] , [{}, {}, {}]]
    rawData.forEach(artwork => {
      records.push(...createInsertData(artwork))
    })
    
    await queryInterface.bulkInsert('ArtworkSubjects', records)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ArtworkSubjects', null, {})
  }
};
