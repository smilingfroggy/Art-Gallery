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

describe('GET /exhibitions/:id/artworks', () => {
  before(async () => {
    // destroy data in test database
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = false', null, { raw: true })
    await db.Exhibition.destroy({ where: {}, truncate: true, force: true })
    await db.Artwork.destroy({ where: {}, truncate: true, force: true })
    await db.ExhibitionArtwork.destroy({ where: {}, truncate: true, force: true })
    await db.Medium.destroy({ where: {}, truncate: true, force: true })
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = true', null, { raw: true })

    let test_exhibition = await db.Exhibition.create({ name: 'test_exhibition_name', privacy: 2 })
    let test_medium = await db.Medium.create({ name: 'test_medium_name' })
    let test_artwork = await db.Artwork.create({ artistName: 'test_artist_name', serialNumber: '12345678', MediumId: test_medium.id })
    await db.ExhibitionArtwork.create({ ExhibitionId: test_exhibition.id, ArtworkId: test_artwork.id })
    let test_private_exhibition = await db.Exhibition.create({ name: 'test_private_exhibition_name', privacy: 0 })
    let test_private_artwork = await db.Artwork.create({ name: 'test_private_artwork', serialNumber: '12345678', MediumId: test_medium.id })
    await db.ExhibitionArtwork.create({ ExhibitionId: test_private_exhibition.id, ArtworkId: test_private_artwork.id })

  })

  it('shows artworks from an public exhibition', (done) => {
    request(app)
      .get('/exhibitions/1/artworks')
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.text).to.include('test_artist_name')
        expect(res.text).to.not.include('test_private_artwork')
        return done()
      })
  })

  it('does not show artworks from a private exhibition', (done) => {
    request(app)
      .get('/exhibitions/2/artworks')
      .end((err, res) => {
        expect(res.status).to.equal(302)
        expect(res.text).to.not.include('test_private_artwork')
        return done()
      })
  })
})