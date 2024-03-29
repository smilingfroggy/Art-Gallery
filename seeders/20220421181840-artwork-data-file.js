'use strict';
const { faker } = require('@faker-js/faker')

// read excel file
const xlsx = require('xlsx')
const wb = xlsx.readFile('./seeders/seedsRawData.xlsx')
const artworks = wb.Sheets['artwork']
const data = xlsx.utils.sheet_to_json(artworks)

module.exports = {
  async up(queryInterface, Sequelize) {
    // query existed media id
    const media = await queryInterface.sequelize.query('SELECT id, name FROM Media', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    })
    // [{ id: 1, name: '水墨紙本' }, { id: 2, name: '設色紙本' }, ... ]

    await queryInterface.bulkInsert('Artworks', data.map(work => {
      let medium = media.find(element => {
        return element.name == work.media
      }).id
      delete work.media
      delete work.size
      delete work.subjects
      delete work.url
      delete work.url_origin
      return {
        ...work,
        creationTime: work.creationTime ? new Date(work.creationTime.toString()) : null,
        MediumId: medium,
        introduction: faker.lorem.paragraph(3),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Artworks', null, {})
  }
};
