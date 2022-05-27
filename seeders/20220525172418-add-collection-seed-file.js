'use strict';
const { faker } = require('@faker-js/faker')

module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query('SELECT id FROM Users WHERE isAdmin = 0', { type: queryInterface.sequelize.QueryTypes.SELECT})
    // [ {id: 1}, {id: 2} ... ]
    const names = [['Connoisseur', 'The Persistence of Memory'], ['Pulse of the Earth', 'Inspirations'], ['Free spirited', 'Delicate touches']]

    await queryInterface.bulkInsert('Collections', users.map((user, index) => { 
      console.log('user index', index)
      return [{
      UserId: user.id,
      name: 'Favorite List',
      description: faker.lorem.sentence(),
      privacy: 0,
      url: '',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      UserId: user.id,
      name: names[index][0],
      description: faker.lorem.sentence(),
      privacy: 2,
      url: '',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      UserId: user.id,
      name: names[index][1],
      description: faker.lorem.sentence(),
      privacy: 2,
      url: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]}).flat())
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Collections', null, {})
  }
};
