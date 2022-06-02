'use strict';
const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('root', bcrypt.genSaltSync(10)),
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: faker.name.findName(),
        email: 'user1@example.com',
        password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10)),
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: faker.name.findName(),
        email: 'user2@example.com',
        password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10)),
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: faker.name.findName(),
        email: 'user3@example.com',
        password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10)),
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {})
  }
};
