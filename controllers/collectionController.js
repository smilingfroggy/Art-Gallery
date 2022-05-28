const { getUser } = require('../helpers/auth-helpers')
const { Op, Sequelize } = require('sequelize')
const db = require('../models');
const Artwork = db.Artwork
const Medium = db.Medium
const ArtworkImage = db.ArtworkImage
const Collection = db.Collection
const User = db.User

const collectionController = {
  getCollections: async (req, res, next) => {
    try {
      // exclude collections created by user itself
      const userId = getUser(req)?.id || null
      const userQuery = userId ? { UserId: { [Op.ne]: userId } } : null
      const collections_rawData = await Collection.findAll({
        where: { 'privacy': 2, ...userQuery },
        attributes: {
          include: [[Sequelize.literal(`(
            SELECT COUNT (*) FROM collectionArtworks AS ca WHERE ca.CollectionId=collection.id
            )`), 'workCount']],
          exclude: ['url', 'createdAt', 'updatedAt']
        },
        include: [{
          model: Artwork, as: 'JoinedArtworks', attributes: ['id'], through: { attributes: [] }, // limit: 4,
          include: { model: ArtworkImage, attributes: ['url'], where: { url: { [Op.not]: null } } }
        }, {
          model: User, attributes: ['name']
        }],
        order: ['updatedAt'],
      })

      const collections = JSON.parse(JSON.stringify(collections_rawData))
      collections.forEach(list => {
        list.description = list.description.slice(0, 45) + "..."
      })

      // user own collections
      let ownCollections = []
      if (userId) {
        const ownCollections_rawData = await Collection.findAll({
          where: { UserId: userId },
          attributes: {
            include: [[Sequelize.literal(`(
              SELECT COUNT (*) FROM collectionArtworks AS ca WHERE ca.CollectionId=collection.id
              )`), 'workCount']],
            exclude: ['url', 'createdAt', 'updatedAt']
          },
          include: {
            model: Artwork, as: 'JoinedArtworks', attributes: ['id'], through: { attributes: [] },
            include: { model: ArtworkImage, attributes: ['url'], where: { url: { [Op.not]: null } } }
          },
          order: ['updatedAt'],
        })

        ownCollections = JSON.parse(JSON.stringify(ownCollections_rawData))
        ownCollections.forEach(list => {
          list.description = list.description.slice(0, 45) + "..."
        })
      }
      // return res.json({ collections, ownCollections })
      return res.render('collections', { collections, ownCollections })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getCollection: async (req, res, next) => {
    try {
      const { collectionId } = req.params
      const userId = getUser(req)?.id || null

      // find user's own collections
      let ownCollections
      if (userId) {
        ownCollections_rawData = await Collection.findAll({
          where: { UserId: userId },
          attributes: ['id']
        })
        ownCollections = JSON.parse(JSON.stringify(ownCollections_rawData))
      }

      // if user owns collection, find anyway; if not, check find public collection only
      let whereQuery = { id: collectionId }
      if (!ownCollections || !ownCollections.find(collection => collection.id === Number(collectionId))) {
        whereQuery.privacy = { [Op.eq]: 2 }
      }

      const collection_rawData = await Collection.findOne({
        where: whereQuery, //  { privacy: 2 } if not owned by user
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
          { model: User, attributes: ['name'] },
          {
            model: Artwork, as: 'JoinedArtworks', through: { attributes: [] },
            attributes: { exclude: ['serialNumber', 'piecesNum', 'introduction', 'createdAt', 'updatedAt'] },
            include: [
              { model: ArtworkImage, attributes: ['id', 'url', 'type'] },
              { model: Medium, attributes: ['name'] }
            ]
          }
        ]
      })
      if (!collection_rawData) throw new Error('Collection unavailable')

      const collection = JSON.parse(JSON.stringify(collection_rawData))
      collection.JoinedArtworks.forEach(work => {
        work.creationTime = work.creationTime ? new Date(work.creationTime).getFullYear() : "",
        work.image = work.ArtworkImages[0] ? work.ArtworkImages[0].url : 'https://i.imgur.com/nVNO3Kj.png'  // if no image in DB, use "no image"
        work.size = (work.depth) ? (work.height + "x" + work.width + "x" + work.depth + " cm") : (work.height + "x" + work.width + " cm")
      })
      collection.workCount = collection.JoinedArtworks.length

      return res.render('collection', { collection })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

module.exports = collectionController