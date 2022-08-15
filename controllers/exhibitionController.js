const db = require('../models')
const { Artwork, Artist, ArtistImage, ArtworkImage, Exhibition, ExhibitionImage, Medium } = db
const { getUser } = require('../helpers/auth-helpers')
const IMAGE_NOT_AVAILABLE = 'https://i.imgur.com/nVNO3Kj.png'
const ARTIST_AVATAR_NOT_AVAILABLE = 'https://i.imgur.com/QJrNwMz.jpg'

const exhibitionController = {
  getExhibitions: async (req, res, next) => {
    try {
      const exhibitions_rawData = await Exhibition.findAll({
        where: { 'privacy': 2 },
        include: [
          { model: ExhibitionImage, attributes: ['url', 'type', 'description'] },
          { model: Artwork, as: 'ContainedArtworks', attributes: ['id'], through: { attributes: [] } },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        order: ['date_start']
      })

      let exhibitionsData = exhibitions_rawData.map(exhibition => {
        let count = exhibition.ContainedArtworks.length
        delete exhibition.dataValues.ContainedArtworks
        let useImage = exhibition.dataValues.ExhibitionImages.find(images => images.type === 'poster')?.url || IMAGE_NOT_AVAILABLE
        return {
          ...exhibition.dataValues,
          date_start: exhibition.dataValues.date_start?.toISOString().slice(0, 10),
          date_end: exhibition.dataValues.date_end?.toISOString().slice(0, 10),
          introduction: exhibition.dataValues.introduction?.slice(0, 55) + "...",
          ExhibitionImages: useImage,
          artwork_sum: count
        }
      })
      return res.render('exhibitions', { exhibitionsData })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getExhibitionInfo: async (req, res, next) => {
    try {
      const exhibition_rawData = await Exhibition.findOne({
        where: {
          privacy: 2,
          id: req.params.exhibitionId
        },
        include: [
          { model: ExhibitionImage, attributes: ['url', 'type', 'description'] },
          {
            model: Artwork, as: 'ContainedArtworks',
            attributes: ['id', 'artistName', 'name'],
            through: { attributes: [] }
          },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      })

      if (!exhibition_rawData) throw new Error('Exhibition unavailable')

      let result = exhibition_rawData.toJSON()
      result.artwork_sum = result.ContainedArtworks.length
      result.date_start = result.date_start?.toISOString().slice(0, 10)
      result.date_end = result.date_end?.toISOString().slice(0, 10)

      // console.log(result.ContainedArtworks) 
      let usePoster = result.ExhibitionImages.find(images => images.type === 'poster')?.url || IMAGE_NOT_AVAILABLE
      result.poster = usePoster

      // return res.json(result)
      return res.render('exhibition_info', { exhibition: result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getExhibitionArtworks: async (req, res, next) => {
    try {
      const userId = getUser(req)?.id || null
      let addedArtworks = getUser(req)?.addedArtworks || new Set()
      let favoriteArtworks = getUser(req)?.favoriteArtworks || []

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
              include: { model: ArtistImage, attributes: { exclude: ['createdAt', 'updatedAt'] } }
            }
          ]
        },
      })

      if (!exhibitionArtworks_rawData) throw new Error('Exhibition artwork unavailable')

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

      // 找出不重複的創作者；每件作品創作者可能不同、每件作品可有多個創作者
      const creators = []
      result.ContainedArtworks.forEach(work => {
        work.Creators.forEach(creator => {
          if (!creators.find(creator_added => creator_added.id === creator.id)) {
            creators.push(creator)
          }
        })
        delete work.Creators
      })

      // 藝術家照片：優先顯示創作者大頭照(type: head)
      creators.forEach(creator => {
        if (creator.ArtistImages.length === 0) {
          creator.ArtistImages = ARTIST_AVATAR_NOT_AVAILABLE  //預設空白大頭照
        } else {
          const headImg = creator.ArtistImages.find(image => image.type === 'head')
          if (headImg) {  // imgur url + b => big thumbnail 
            creator.ArtistImages = headImg.url.split('.jpg')[0] + 'b.jpg'
          } else {
            creator.ArtistImages = creator.ArtistImages[0].url.split('.jpg')[0] + 'b.jpg'
          }
        }
        creator.introduction = creator.introduction?.split("。")[0] + "。"
      })

      result.Creators = creators

      return res.render('exhibition_artworks', { exhibition: result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getExhibitionImages: async (req, res, next) => {
    try {
      const exhibitionImages_rawData = await Exhibition.findOne({
        where: {
          privacy: 2,
          id: req.params.exhibitionId
        },
        attributes: ['id', 'name'],
        include: {
          model: ExhibitionImage, attributes: ['id', 'url', 'type', 'description'],
        },
      })
      if (!exhibitionImages_rawData) throw new Error('Exhibition images unavailable')
      const exhibitionImages = exhibitionImages_rawData.toJSON()

      return res.render('exhibition_images', { exhibition: exhibitionImages })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

}

module.exports = exhibitionController