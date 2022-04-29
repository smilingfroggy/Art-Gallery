'use strict';

// read excel file
const xlsx = require('xlsx')
const wb = xlsx.readFile('./seeders/seedsRawData.xlsx')
const exhibitions = wb.Sheets['artwork']
const data = xlsx.utils.sheet_to_json(exhibitions)

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
      return {
        ...work,
        creationTime: work.creationTime ? new Date(work.creationTime.toString()) : null,
        MediumId: medium,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Artworks', null, {})
  }
};
