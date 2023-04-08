const db = require('../models');
const { Artwork, ArtworkImage, Exhibition, ExhibitionImage, Medium, Artist, ArtistImage } = db
const sequelize = require('sequelize')
const helpers = require('../helpers/auth-helpers')
const { IMAGE_NOT_AVAILABLE, getHeadImage } = require('../helpers/image-helpers')

const exhibitionService = {
  getExhibitions: async (req, res) => {  // cb
    const exhibitions_rawData = await Exhibition.findAll({
      where: { 'privacy': 2 },
      include: [
        { model: ExhibitionImage, attributes: ['url', 'type', 'description'] },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
        include: [[sequelize.literal(`(
          SELECT COUNT (*) FROM exhibitionArtworks As ca WHERE ca.exhibitionId = exhibition.id
        )`), 'artwork_sum']]
      },
      order: ['date_start']
    })

    let exhibitionsData = exhibitions_rawData.map(exhibition => {
      let useImage = exhibition.dataValues.ExhibitionImages.find(images => images.type === 'poster')?.url || IMAGE_NOT_AVAILABLE
      return {
        ...exhibition.dataValues,
        date_start: exhibition.dataValues.date_start?.toISOString().slice(0, 10),
        date_end: exhibition.dataValues.date_end?.toISOString().slice(0, 10),
        introduction: exhibition.dataValues.introduction?.slice(0, 55) + "...",
        ExhibitionImages: useImage,
      }
    })

    // return cb(exhibitionsData)
    return exhibitionsData
  },
  getExhibition: async (req, res) => {
    // selected exhibition's info, sum of works, poster
    const exhibition_rawData = await Exhibition.findOne({
      where: {
        privacy: 2,
        id: req.params.exhibitionId
      },
      include: [
        { model: ExhibitionImage, attributes: ['url', 'type', 'description'] },
      ],
      attributes: { 
        exclude: ['createdAt', 'updatedAt'],
        include: [[sequelize.literal(`(
          SELECT COUNT (*) FROM exhibitionArtworks AS ea WHERE ea.exhibitionId = exhibition.id 
        )`), 'artwork_sum']]
      },
    })

    if (!exhibition_rawData) {
      res.status(404)
      throw new Error('Exhibition unavailable')
    }

    let result = exhibition_rawData.toJSON()
    result.date_start = result.date_start?.toISOString().slice(0, 10)
    result.date_end = result.date_end?.toISOString().slice(0, 10)
    result.poster = result.ExhibitionImages.find(images => images.type === 'poster')?.url || IMAGE_NOT_AVAILABLE
    return result
  },
  getExhibitionArtworks: async (req, res) => {
    // selected exhibition's artworks details & added to user's collections
    const user = helpers.getUser(req) || null
    let addedArtworks = user?.addedArtworks || new Set()
    let favoriteArtworks = user?.favoriteArtworks || []

    const exhibitionArtworks_rawData = await Exhibition.findOne({
      where: {
        privacy: 2,
        id: req.params.exhibitionId
      },
      attributes: ['id', 'name', 'privacy'],
      include: {
        model: Artwork, as: 'ContainedArtworks',
        attributes: ['id', 'artistName', 'name', 'creationTime', 'height', 'width', 'depth'],
        through: { attributes: [] },
        include: [
          { model: Medium, attributes: ['name'] },
          { model: ArtworkImage, attributes: ['url'] },
          {
            model: Artist, as: 'Creators', through: { attributes: [] },
            attributes: ['id', 'name', 'birthYear', 'deathYear', 'introduction'],
          }
        ]
      },
    })
    if (!exhibitionArtworks_rawData) {
      res.status(404)
      throw new Error('Exhibition artwork unavailable')
    }

    let result = exhibitionArtworks_rawData.toJSON()
    result.artwork_sum = result.ContainedArtworks.length
    // 整理藝術品資料: name, medium, time, image, size...
    result.ContainedArtworks.forEach(work => {
      work.name = work.name?.slice(0, 20)
      work.medium = work.Medium.name
      work.creationTime = work.creationTime ? new Date(work.creationTime).getFullYear() : ""
      work.image = work.ArtworkImages[0]?.url || IMAGE_NOT_AVAILABLE
      delete work.Medium
      delete work.ArtworkImages
      work.size = work.depth ? (work.height + "x" + work.width + "x" + work.depth) : (work.height + "x" + work.width)
      work.isAdded = addedArtworks.has(work.id)
      work.isFavorite = favoriteArtworks.includes(work.id)
    })

    return result
  },
  getExhibitionArtists: async (req, res) => {
    const exhibitionArtists_rawData = await Exhibition.findOne({
      where: {
        privacy: 2,
        id: req.params.exhibitionId
      },
      attributes: ['id', 'name'],
      include: {
        model: Artwork, as: 'ContainedArtworks',
        attributes: ['id'],
        through: { attributes: [] },
        include: {
          model: Artist, as: 'Creators', through: { attributes: [] },
          attributes: ['id', 'name', 'introduction'],
          order: [['birthYear', 'DESC']],
          include: { model: ArtistImage, attributes: { exclude: ['createdAt', 'updatedAt'] } }
        }
      }
    })

    if (!exhibitionArtists_rawData) {
      res.status(404)
      throw new Error('No artists found!')
    }
    // 去除重複的創作者；每件作品創作者可能不同、每件作品可有多個創作者
    const creators = new Map()
    exhibitionArtists_rawData.toJSON().ContainedArtworks.forEach(work => {
      work.Creators.forEach(creator => {
        if (!creators.get(creator.id)) {
          // 藝術家照片：優先顯示創作者大頭照(type: head)
          getHeadImage(creator)

          creator.introduction = creator.introduction?.split("。")[0] + "。"
          creators.set(creator.id, creator)
        }
      })
    })
    return Array.from(creators.values())

  },
  getExhibitionImages: async (req, res, next) => {
    const exhibitionImages_rawData = await Exhibition.findOne({
      where: {
        privacy: 2,
        id: req.params.exhibitionId
      },
      attributes: ['id', 'name'],
      include: {
        model: ExhibitionImage, attributes: ['id', 'url', 'type', 'description'],
      }
    })
    if (!exhibitionImages_rawData) {
      res.status(404)
      throw new Error('Exhibition images unavailable')
    }
    return exhibitionImages_rawData.toJSON()
  }
}

module.exports = exhibitionService