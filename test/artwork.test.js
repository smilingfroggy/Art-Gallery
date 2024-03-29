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
    await db.Subject.destroy({ where: {}, truncate: true, force: true })
    await db.ArtworkSubject.destroy({ where: {}, truncate: true, force: true })
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = true', null, { raw: true })

    // create data: artist, medium, subject, artwork
    let test_artist_A = await db.Artist.create({ name: 'test_artist_A' })
    let test_artist_B = await db.Artist.create({ name: 'test_artist_B' })
    let test_medium_ink = await db.Medium.create({ name: 'test_medium_ink' })
    let test_medium_water = await db.Medium.create({ name: 'test_medium_water' })
    let subject_animal = await db.Subject.create({ name: 'animal' })
    let subject_plant = await db.Subject.create({ name: 'plant' })

    let test_artwork1 = await db.Artwork.create({
      artistName: 'test_artist_A',
      name: 'The First Work',
      serialNumber: '12345678',
      MediumId: test_medium_ink.id,
      height: 100,
      width: 80,
      creationTime: new Date(2001, 1, 1)
    })
    await db.ArtworkArtist.create({ ArtistId: test_artist_A.id, ArtworkId: test_artwork1.id })
    await db.ArtworkSubject.create({ SubjectId: subject_animal.id, ArtworkId: test_artwork1.id })

    let test_artwork2 = await db.Artwork.create({
      artistName: 'test_artist_B',
      name: 'The Second Work',
      serialNumber: '23456789',
      MediumId: test_medium_water.id,
      height: 120,
      width: 40,
      creationTime: new Date(1985, 1, 1)
    })
    await db.ArtworkArtist.create({ ArtistId: test_artist_B.id, ArtworkId: test_artwork2.id })
    await db.ArtworkSubject.create({ SubjectId: subject_animal.id, ArtworkId: test_artwork2.id })

    let test_artwork3 = await db.Artwork.create({
      artistName: 'test_artist_A',
      name: 'The Third Work',
      serialNumber: '34567890',
      MediumId: test_medium_water.id,
      height: 45,
      width: 90,
      creationTime: new Date(2002, 1, 1)
    })
    await db.ArtworkArtist.create({ ArtistId: test_artist_A.id, ArtworkId: test_artwork3.id })
    await db.ArtworkSubject.create({ SubjectId: subject_plant.id, ArtworkId: test_artwork3.id })
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

describe('GET /artworks/search', () => {
  it('shows correct results of medium', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ medium: 'medium_ink' })
      .end((err, res) => {
        expect(res.text).to.include('The First Work')   // work name
        expect(res.text).to.not.include('The Second Work')
        expect(res.text).to.not.include('The Third Work')
        expect(res.text).to.not.include('collapse show')  // closed options
        return done()
      })
  })

  it('shows correct results of medium ID', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ mediumId: 2 })
      .end((err, res) => {
        expect(res.text).to.not.include('The First Work')   // work name
        expect(res.text).to.include('The Second Work')
        expect(res.text).to.include('The Third Work')
        expect(res.text).to.not.include('collapse show')  // closed options
        return done()
      })
  })

  it('shows correct results of artist', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ artist: 'artist_A' })
      .end((err, res) => {
        expect(res.text).to.include('The First Work')
        expect(res.text).to.not.include('The Second Work')
        expect(res.text).to.include('The Third Work')
        expect(res.text).to.not.include('collapse show')  // closed options
        return done()
      })
  })

  it('shows correct results of artist ID', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ artistId: 2 })
      .end((err, res) => {
        expect(res.text).to.not.include('The First Work')
        expect(res.text).to.include('The Second Work')
        expect(res.text).to.not.include('The Third Work')
        expect(res.text).to.not.include('collapse show')  // closed options
        return done()
      })
  })

  it('shows correct results of work name', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ artworkName: 'First' })
      .end((err, res) => {
        expect(res.text).to.include('The First Work')   // work name
        expect(res.text).to.not.include('The Second Work')
        expect(res.text).to.not.include('The Third Work')
        expect(res.text).to.not.include('collapse show')  // closed options
        return done()
      })
  })

  it('shows correct results of subject', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ subject: 'ani' })
      .end((err, res) => {
        expect(res.text).to.include('The First Work')
        expect(res.text).to.include('The Second Work')
        expect(res.text).to.not.include('The Third Work')
        expect(res.text).to.not.include('collapse show')  // closed options
        return done()
      })
  })

  it('shows correct result of subject ID', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ subjectId: 2 })
      .end((err, res) => {
        expect(res.text).to.not.include('The First Work')
        expect(res.text).to.not.include('The Second Work')
        expect(res.text).to.include('The Third Work')
        expect(res.text).to.not.include('collapse show')  // closed options
        return done()
      })
  })

  it('shows correct results of size query', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ height_lower: 90 })
      .end((err, res) => {
        expect(res.text).to.include('The First Work')
        expect(res.text).to.include('The Second Work')
        expect(res.text).to.not.include('The Third Work')
        expect(res.text).to.include('collapse show')  // opened options
        return done()
      })
  })

  it('shows correct results of size query', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ width_upper: 75 })
      .end((err, res) => {
        expect(res.text).to.not.include('The First Work')
        expect(res.text).to.include('The Second Work')
        expect(res.text).to.not.include('The Third Work')
        expect(res.text).to.include('collapse show')  // opened options
        return done()
      })
  })

  it('shows correct results of shape query', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ shape_portrait: true })
      .end((err, res) => {
        expect(res.text).to.include('The First Work')
        expect(res.text).to.include('The Second Work')
        expect(res.text).to.not.include('The Third Work')
        expect(res.text).to.include('collapse show')  // opened options
        return done()
      })
  })

  it('shows no result', (done) => {
    request(app)
      .get('/artworks/search')
      .query({ width_lower: 100, medium: 'ink' })
      .end((err, res) => {
        expect(res.text).to.include('查無藝術品，請重新搜尋')
        expect(res.text).to.include('collapse show')  // opened options
        return done()
      })
  })
})

describe('GET /artworks/id', () => {
  it('shows artwork info', (done) => {
    request(app)
      .get('/artworks/1')
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.text).to.include('test_artist_A')  // artist name
        expect(res.text).to.include('The First Work')  // work name
        expect(res.text).to.include('animal')    // subject
        expect(res.text).to.include('test_medium_ink')  // medium
        expect(res.text).to.include('2001')   // creationTime
        return done()
      })
  })
})