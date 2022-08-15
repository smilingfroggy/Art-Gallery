const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const app = require('../app')
const db = require('../models')

describe('GET /artworks', () => {
  before(async () => {
    // destroy data in test database
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = false', null, { raw: true })
    await db.Artist.destroy({ where: {}, truncate: true, force: true })
    await db.Artwork.destroy({ where: {}, truncate: true, force: true })
    await db.ArtworkArtist.destroy({ where: {}, truncate: true, force: true })
    await db.Medium.destroy({ where: {}, truncate: true, force: true })
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = true', null, { raw: true })

    let test_artist_A = await db.Artist.create({ name: 'test_artist_A' })
    let test_artist_B = await db.Artist.create({ name: 'test_artist_B' })
    let test_medium_ink = await db.Medium.create({ name: 'test_medium_ink' })
    let test_medium_water = await db.Medium.create({ name: 'test_medium_water' })

    let test_artwork1 = await db.Artwork.create({
      artistName: 'test_artist_A',
      name: 'The First Work',
      serialNumber: '12345678',
      MediumId: test_medium_ink.id,
      height: 100,
      width: 80,
      creationTime: 2001
    })
    await db.ArtworkArtist.create({ ArtistId: test_artist_A.id, ArtworkId: test_artwork1.id })

    let test_artwork2 = await db.Artwork.create({
      artistName: 'test_artist_B',
      name: 'The Second Work',
      serialNumber: '23456789',
      MediumId: test_medium_water.id,
      height: 120,
      width: 40,
      creationTime: 1985
    })
    await db.ArtworkArtist.create({ ArtistId: test_artist_B.id, ArtworkId: test_artwork2.id })

    let test_artwork3 = await db.Artwork.create({
      artistName: 'test_artist_A',
      name: 'The Third Work',
      serialNumber: '34567890',
      MediumId: test_medium_water.id,
      height: 45,
      width: 90,
      creationTime: 2002
    })
    await db.ArtworkArtist.create({ ArtistId: test_artist_A.id, ArtworkId: test_artwork3.id })
  })

  it('shows searching selections and works', (done) => {
    request(app)
      .get('/artworks')
      .expect(200)
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.text).to.include('媒材')
        expect(res.text).to.include('藝術家')
        expect(res.text).to.include('test_medium_ink')
        expect(res.text).to.include('test_artist_A')
        expect(res.text).to.include('test_artist_B')
        expect(res.text).to.not.include(`alert alert-danger alert-dismissible`)
        expect(res.text).to.not.include(`查無藝術品，請重新搜尋`)
        return done()
      })
  })
})
