'use strict';
const { faker } = require('@faker-js/faker')

module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query('SELECT id FROM Users WHERE isAdmin = 0', { type: queryInterface.sequelize.QueryTypes.SELECT})
    // [ {id: 1}, {id: 2} ... ]

    await queryInterface.bulkInsert('Collections', users.map(user => { return [{
      UserId: user.id,
      name: 'Favorite List',
      description: faker.lorem.sentence(),
      privacy: 2,
      url: '',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      UserId: user.id,
      name: user.id % 2 ? 'Renting List' : 'Connoisseur',
      description: faker.lorem.sentence(),
      privacy: 0,
      url: '',
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      UserId: user.id,
      name: user.id % 2 ? 'The Persistence of Memory' : 'Inspirations',
      description: faker.lorem.sentence(),
      privacy: 2,
      url: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]}).flat())
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Collection', null, {})
  }
};
