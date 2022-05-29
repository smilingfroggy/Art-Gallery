const { getUser } = require('../../helpers/auth-helpers')
const { Sequelize } = require('sequelize')
const db = require('../../models');
const Artwork = db.Artwork
const Collection = db.Collection

const collectionController = {
  getOwnCollections: async (req, res, next) => {
    try {
      const userId = getUser(req)?.id || null
      const ownCollections_rawData = await Collection.findAll({
        where: { UserId: userId },
        attributes: ['id', 'name', 
          [Sequelize.literal(`(
            SELECT COUNT (*) FROM collectionArtworks AS ca WHERE ca.CollectionId=collection.id
            )`), 'workCount']
        ],
        include: {
          model: Artwork, as: 'JoinedArtworks', attributes: ['id'], through: { attributes: [] },
        },
        order: ['updatedAt'],
      })

      const ownCollections = JSON.parse(JSON.stringify(ownCollections_rawData))
 
      return res.json(ownCollections)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

module.exports = collectionController