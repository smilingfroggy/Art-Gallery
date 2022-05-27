const { getUser } = require('../helpers/auth-helpers')
const { Op, Sequelize } = require('sequelize')
const db = require('../models');
const Artwork = db.Artwork
const Medium = db.Medium
const Artist = db.Artist
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
  }
}

module.exports = collectionController