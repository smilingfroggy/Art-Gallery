const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const app = require('../app')
const db = require('../models')

describe('GET /exhibitions', () => {
  it('shows exhibitions', (done) => {
    request(app)
      .get('/exhibitions')
      .end((err, res) => {
        if (err) return done(err)
        expect(res.status).to.equal(200)
        expect(res.text).to.not.include(`alert alert-danger alert-dismissible`)
        expect(res.text).to.include('展期')
        return done()
      })
  })
})

describe('GET /exhibitions/:id', () => {
  it('throws error when exhibition does not exist', (done) => {
    let falseId = '2323232ee'
    request(app)
      .get(`/exhibitions/${falseId}`)
      .end((err, res) => {
        expect(res.status).to.equal(302)
        return done()
      })
  })

  before(async () => {
    // destroy data in test database
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = false', null, { raw: true })
    // await db.User.destroy({ where: {}, truncate: true, force: true })
    await db.Exhibition.destroy({ where: {}, truncate: true, force: true })
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = true', null, { raw: true })

    // TODO
    // mock login admin user
    // await db.User.create({ })

    await db.Exhibition.create({ name: 'test_exhibition_name', privacy: 2 })
    await db.Exhibition.create({ name: 'test_private_exhibition_name', privacy: 0 })
  })

  it('shows exhibition info', (done) => {
    request(app)
      .get('/exhibitions/1')
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.text).to.include('test_exhibition_name')
        return done()
      })
  })

  it('does not show exhibition when it is private', (done) => {
    request(app)
      .get('/exhibitions/2')
      .end((err, res) => {
        expect(res.status).to.equal(302)
        expect(res.text).to.not.include('test_private_exhibition_name')
        return done()
      })
  })
})

