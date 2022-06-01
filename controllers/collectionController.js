const db = require('../models');
const { Artwork, ArtworkImage, Collection, CollectionArtwork, Medium, User } = db
const { getUser } = require('../helpers/auth-helpers')
const { Op, Sequelize } = require('sequelize')
const IMAGE_NOT_AVAILABLE = 'https://i.imgur.com/nVNO3Kj.png'

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

      function checkImage(source) {
        if (!source.JoinedArtworks.length) {  // if no works were added yet
          source.JoinedArtworks.push({ ArtworkImages: [{ url: IMAGE_NOT_AVAILABLE }] })
        } else if (!source.JoinedArtworks[0].ArtworkImages.length) {   // if work has no image
          source.JoinedArtworks.push({ ArtworkImages: [{ url: IMAGE_NOT_AVAILABLE }] })
        }
      }

      const collections = JSON.parse(JSON.stringify(collections_rawData))
      collections.forEach(list => {
        list.description = list.description.slice(0, 45) + "..."
        checkImage(list)
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
          checkImage(list)
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
      let ownCollections = getUser(req)?.Collections
      let ownership = false
      let notFavorite = false
      let addedArtworks = getUser(req)?.addedArtworks || new Set()
      let favoriteArtworks = getUser(req)?.favoriteArtworks || []

      if (ownCollections) {
        ownership = !!ownCollections.find(collection => collection.id === Number(collectionId))
        notFavorite = ownCollections.find(collection => collection.name === 'Favorite List').id !== Number(collectionId)
      }

      // if user owns collection, find anyway; if not, check find public collection only
      let whereQuery = { id: collectionId }
      if (!ownCollections || !ownership) {
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
      if (!collection_rawData) {
        req.flash('error_messages', 'Collection unavailable')
        return res.redirect('/collections')
      }

      const collection = JSON.parse(JSON.stringify(collection_rawData))
      collection.JoinedArtworks.forEach(work => {
        work.name = work.name.slice(0, 22)
        work.creationTime = work.creationTime ? new Date(work.creationTime).getFullYear() : "",
        work.image = work.ArtworkImages[0]?.url || IMAGE_NOT_AVAILABLE
        work.size = work.depth ? (work.height + "x" + work.width + "x" + work.depth) : (work.height + "x" + work.width)
        work.isAdded = addedArtworks.has(work.id)
        work.isFavorite = favoriteArtworks.includes(work.id)
      })
      collection.workCount = collection.JoinedArtworks.length
      collection.editable = ownership && notFavorite

      return res.render('collection', { collection })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  postCollection: async (req, res, next) => {
    try {
      const { name, description } = req.body
      const userId = getUser(req)?.id
      if (description.length > 100 || name.length > 25) throw new Error("Collection's name or description is over limit")

      await Collection.create({
        UserId: userId,
        name, description,
        privacy: 0  // default to private
      })
      req.flash('success_messages', `Created collection ${name}`)
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  putCollection: async (req, res, next) => {
    try {
      const { name, description, privacy } = req.body
      const { collectionId } = req.params
      const userId = getUser(req)?.id
      if (description.length > 100 || name.length > 25) throw new Error("Collection's name or description is over limit")

      const collection_rawData = await Collection.findByPk(collectionId, {
        include: { model: User, attributes: ['id'] }
      })
      if (!collection_rawData) throw new Error('Please provide valid collection Id')
      if (collection_rawData.User.id !== userId) throw new Error('Permission denied')
      if (collection_rawData.name === 'Favorite') throw new Error('Favorite cannot be edited')

      await collection_rawData.update({
        name, description,
        privacy: privacy === 'on' ? 2 : 0
      })
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteCollection: async (req, res, next) => {
    try {
      const { collectionId } = req.params
      const userId = getUser(req)?.id

      const collection_rawData = await Collection.findByPk(collectionId, {
        include: [
          { model: User, attributes: ['id'] },
          { model: Artwork, as: 'JoinedArtworks', through: { attributes: [] }, attributes: ['id'] }
        ]
      })
      if (!collection_rawData) throw new Error('Please provide valid collection Id')
      if (collection_rawData.User.id !== userId) throw new Error('Permission denied')

      const collection = JSON.parse(JSON.stringify(collection_rawData))
      const workCount = collection.JoinedArtworks.length
      Promise.all([
        CollectionArtwork.destroy({ where: { CollectionId: collectionId } }),
        collection_rawData.destroy(),
      ]).then(() => {
        req.flash('success_messages', `Deleted 1 collection and ${workCount} works`)
        return res.redirect('/collections')
      }).catch(error => console.log(error))
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  putCollectionArtworks: async (req, res, next) => {
    try {
      const userId = getUser(req)?.id || null
      const { artworkId } = req.params
      let { collectionId_select } = req.body//[ '42', '50' ] or 50

      if (typeof collectionId_select === "string") collectionId_select = [collectionId_select]
      if (!collectionId_select) collectionId_select = []
      console.log('[collectionId_select]:', collectionId_select)

      // 找出使用者 所有包含此作品的收藏清單
      const artwork_rawData = await Artwork.findByPk(artworkId, {
        attributes: ['id'],
        include: { model: Collection, as: 'JoinedCollections', through: { attributes: [] }, 
          attributes: ['id', 'UserId'], where: { UserId: userId} 
        }, 
      })
      const joinedCollection = artwork_rawData?.toJSON().JoinedCollections || null
      const joinedCollectionId = joinedCollection ? joinedCollection.map(col => col.id) : []  // [ 43, 45 ]
      console.log('joinedCollectionId', joinedCollectionId)

      // 多的要加入，少的要刪除
      const toAddCollections = collectionId_select.filter(id => !joinedCollectionId.includes(Number(id)))
      const toRemoveCollections = joinedCollectionId.filter(id => !collectionId_select.includes(String(id)))
      console.log('toAddCollections:', toAddCollections, 'toRemoveCollections:', toRemoveCollections)

      Promise.all([
        CollectionArtwork.bulkCreate(toAddCollections.map(id => {
          return {
            CollectionId: id,
            ArtworkId: artworkId
          }
        })),
        ...toRemoveCollections.map(id => CollectionArtwork.destroy({
          where: {
            CollectionId: id,
            ArtworkId: artworkId
          }
        }))
      ]).then(() => {
        return res.redirect('back')
      }).catch(error => console.log(error))
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  addFavorite: async (req, res, next) => {
    try {    
      const userId = getUser(req)?.id || null
      const { artworkId } = req.params
      const Collection_fav = await Collection.findOne({
        where: { UserId: userId, name: 'Favorite List' },
        attributes: ['id'], raw: true
      })
      if (!Collection_fav) throw new Error('Favorite List unavailable')

      await CollectionArtwork.create({
        CollectionId: Collection_fav.id,
        ArtworkId: artworkId
      })
      req.flash('success_messages', 'Added to Favorite List')
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteFavorite: async(req, res, next) => {
    try {
      const userId = getUser(req)?.id || null
      const { artworkId } = req.params
      const Collection_fav = await Collection.findOne({
        where: { UserId: userId, name: 'Favorite List' },
        attributes: ['id'], raw: true
      })
      if (!Collection_fav) throw new Error('Favorite List unavailable')

      await CollectionArtwork.destroy({
        where: {
          CollectionId: Collection_fav.id,
          ArtworkId: artworkId
        }
      })
      req.flash('success_messages', 'Removed from Favorite List')
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

module.exports = collectionController