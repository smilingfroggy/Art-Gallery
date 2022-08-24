const app = require('../app')
const chai = require('chai')
const db = require('../models')
const expect = chai.expect
const helpers = require('../helpers/auth-helpers')
const request = require('supertest')
const sinon = require('sinon')


describe('GET /collections', () => {
  describe('before login', () => {
    before(async () => {
      // destroy data
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = false', null, { raw: true })
      await db.Collection.destroy({ where: {}, truncate: true, force: true })
      await db.CollectionArtwork.destroy({ where: {}, truncate: true, force: true })
      await db.Artwork.destroy({ where: {}, truncate: true, force: true })
      await db.Medium.destroy({ where: {}, truncate: true, force: true })
      await db.User.destroy({ where: {}, truncate: true, force: true })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = true', null, { raw: true })

      // create data
      // mock login admin user
      const user1 = await db.User.create({ name: 'test_user1', email: 'test1@test.com', password: '12345678' })
      const user2 = await db.User.create({ name: 'test_user2', email: 'test2@test.com', password: '12345678' })
      const collection1_1 = await db.Collection.create({ UserId: user1.id, name: 'collection1-1', privacy: 2 })
      const collection1_2 = await db.Collection.create({ UserId: user1.id, name: 'collection1-2' })  // private collection
      const collection2 = await db.Collection.create({ UserId: user2.id, name: 'collection2', privacy: 2 })


      let test_medium_ink = await db.Medium.create({ name: 'test_medium_ink' })
      let test_medium_water = await db.Medium.create({ name: 'test_medium_water' })
      let test_artwork1 = await db.Artwork.create({
        artistName: 'test_artist_A',
        name: 'The First Work',
        serialNumber: '12345678',
        MediumId: test_medium_ink.id,
        height: 100,
        width: 80,
        creationTime: new Date(2001, 1, 1)
      })

      let test_artwork2 = await db.Artwork.create({
        artistName: 'test_artist_B',
        name: 'The Second Work',
        serialNumber: '23456789',
        MediumId: test_medium_water.id,
        height: 120,
        width: 40,
        creationTime: new Date(1985, 1, 1)
      })

      let test_artwork3 = await db.Artwork.create({
        artistName: 'test_artist_A',
        name: 'The Third Work',
        serialNumber: '34567890',
        MediumId: test_medium_water.id,
        height: 45,
        width: 90,
        creationTime: new Date(2002, 1, 1)
      })

      await db.CollectionArtwork.create({ CollectionId: collection1_1.id, ArtworkId: test_artwork1.id })
      await db.CollectionArtwork.create({ CollectionId: collection1_1.id, ArtworkId: test_artwork3.id })
      await db.CollectionArtwork.create({ CollectionId: collection1_2.id, ArtworkId: test_artwork1.id })
      await db.CollectionArtwork.create({ CollectionId: collection1_2.id, ArtworkId: test_artwork2.id })
      await db.CollectionArtwork.create({ CollectionId: collection2.id, ArtworkId: test_artwork2.id })
      await db.CollectionArtwork.create({ CollectionId: collection2.id, ArtworkId: test_artwork3.id })

    })

    it('shows all public collections when user is not logged in', (done) => {
      request(app)
        .get('/collections')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.text).to.include('collection1-1')
          expect(res.text).to.include('collection2')
          expect(res.text).to.not.include('collection1-2')
          return done()
        })
    })
  })
  
  describe('after login', () => {
    before(async () => {
      sinon.stub(helpers, 'getUser')
        .returns({ id: 1, name: 'test_user1', isAdmin: false, Collections: [] })
    })

    it("shows user's private collections when user is logged in", (done) => {
      request(app)
        .get('/collections')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.text).to.include('collection1-1') // user1's public collection
          expect(res.text).to.include('collection1-2') // user1's private collection
          expect(res.text).to.include('collection2') // user2's public collection
          return done()
        })
    })
  })

  after(() => {
    helpers.getUser.restore()
  })
})


describe('GET /collections/:id', () => {
  describe('before login', () => {
    it('shows artworks', (done) => {
      request(app)
        .get('/collections/1')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.text).to.include('collection1-1')
          expect(res.text).to.include('The First Work')
          expect(res.text).to.not.include('The Second Work')
          expect(res.text).to.include('The Third Work')
          return done()
        })
    })

    it('does not show artworks of other users private collection', (done) => {
      request(app)
        .get('/collections/2')
        .expect(302)
        .end((err, res) => {
          expect(res.status).to.equal(302)
          return done()
        })
    })
  })

  describe('after login', () => {
    before(() => {
      sinon.stub(helpers, 'getUser')
        .returns({
          id: 1, name: 'test_user1', isAdmin: false, Collections: [
            { id: 1, name: 'collection1-1' },
            { id: 2, name: 'collection1-2' }
          ]
        })
    })
    it("shows artworks of users' own collection", (done) => {
      request(app)
        .get('/collections/2')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.text).to.include('collection1-2')
          expect(res.text).to.include('The First Work')
          expect(res.text).to.include('The Second Work')
          expect(res.text).to.not.include('The Third Work')
          return done()
        })
    })

    after(() => {
      helpers.getUser.restore()
    })
  })
})


describe('POST /collections', () => {
  before(() => {
    sinon.stub(helpers, 'getUser')
      .returns({
        id: 1, name: 'test_user1', isAdmin: false, Collections: [
          { id: 1, name: 'collection1-1' },
          { id: 2, name: 'collection1-2' },
          { id: 4, name: 'new_collection' }
        ]
      })
    sinon.stub(helpers, 'ensureAuthenticated')
      .returns(true)
  })

  it('create collections successfully', (done) => {
    let collection = {
      name: 'new_collection',
      description: 'Special Room for Testing',
    }
    request(app)
      .post('/collections')
      .send(collection)
      .end((err, res) => {
        expect(res.status).to.equal(302)
        request(app)
          .get('/collections/4')
          .end((err, res) => {
            expect(res.status).to.equal(200)
            expect(res.text).to.include(collection.description)
            expect(res.text).to.include('尚無作品加入')
            return done()
          })
      })
  })

  after(() => {
    helpers.getUser.restore()
    helpers.ensureAuthenticated.restore()
  })
})


describe('PUT /collections/:id', () => {
  before(() => {
    sinon.stub(helpers, 'getUser')
      .returns({
        id: 1, name: 'test_user1', isAdmin: false, Collections: [
          { id: 1, name: 'collection1-1' },
          { id: 2, name: 'collection1-2' },
          { id: 4, name: 'new_collection' }
        ]
      })
    sinon.stub(helpers, 'ensureAuthenticated')
      .returns(true)
  })

  it('edit collection\'s name and privacy successfully', (done) => {
    let collection = {
      name: 'edited_collection',
      description: 'Special Room for Testing',
      privacy: 'on'
    }
    request(app)
      .put('/collections/4')
      .send(collection)
      .end((err, res) => {
        expect(res.status).to.equal(302)
        request(app)
          .get('/collections/4')
          .end((err, res) => {
            expect(res.status).to.equal(200)
            expect(res.text).to.include(collection.name)
            expect(res.text).to.include('尚無作品加入')
            return done()
          })
      })
  })

  after(() => {
    helpers.getUser.restore()
    helpers.ensureAuthenticated.restore()
  })
})


})