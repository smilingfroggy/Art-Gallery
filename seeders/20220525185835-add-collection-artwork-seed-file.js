'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const collections = await queryInterface.sequelize.query(
      'SELECT id FROM Collections',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const artworks = await queryInterface.sequelize.query(
      'SELECT id FROM Artworks',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    
    await queryInterface.bulkInsert('CollectionArtworks', collections.map(collection => {
      let artworks_select = artworks.slice(0)
      return Array.from({ length: 10 }, (_value, key) => { return {
        CollectionId: collection.id,
        ArtworkId: selectUnrepeatArtworks(artworks_select),
        createdAt: new Date(),
        updatedAt: new Date()
      }})
    }).flat(), {})
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CollectionArtworks', null, {})
  }
};

function selectUnrepeatArtworks(arr) {
  let index = Math.floor(Math.random() * arr.length)
  let id = arr[index].id
  arr.splice(index, 1)
  return id
}

