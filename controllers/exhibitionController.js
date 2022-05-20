const db = require('../models');
const Artwork = db.Artwork
const Exhibition = db.Exhibition
const ExhibitionImage = db.ExhibitionImage
const Medium = db.Medium
const Artist = db.Artist
const ArtistImage = db.ArtistImage
const ArtworkImage = db.ArtworkImage

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
        let useImage = exhibition.dataValues.ExhibitionImages.find(images => images.type === 'poster')?.url || 'https://i.imgur.com/nVNO3Kj.png'   // if no poster, use "no image"
        return {
          ...exhibition.dataValues,
          date_start: exhibition.dataValues.date_start.toISOString().slice(0, 10),
          date_end: exhibition.dataValues.date_end.toISOString().slice(0, 10),
          introduction: exhibition.dataValues.introduction.slice(0, 55) + "...",
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
      const count_work = result.ContainedArtworks.length
      result.artwork_sum = count_work

      // console.log(result.ContainedArtworks) 
      let usePoster = result.ExhibitionImages.find(images => images.type === 'poster')?.url || 'https://i.imgur.com/nVNO3Kj.png'   // if no poster, use "no image"
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
      // 整理藝術品資料: medium, size
      const count_work = result.ContainedArtworks.length
      result.artwork_sum = count_work

      result.ContainedArtworks.forEach(work => {
        work.medium = work.Medium.name
        work.image = work.ArtworkImages[0]?.url || 'https://i.imgur.com/nVNO3Kj.png'  // if no image in DB, use "no image"
        delete work.Medium
        delete work.ArtworkImages
        work.size = (work.depth) ? (work.height + "x" + work.width + "x" + work.depth + " cm") : (work.height + "x" + work.width + " cm")
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
          creator.ArtistImages = 'https://i.imgur.com/QJrNwMz.jpg'  //預設空白大頭照
        } else {
          const headImg = creator.ArtistImages.find(image => image.type === 'head')
          if (headImg) {  // imgur url + b => big thumbnail 
            creator.ArtistImages = headImg.url.split('.jpg')[0] + 'b.jpg'
          } else {
            creator.ArtistImages = creator.ArtistImages[0].url.split('.jpg')[0] + 'b.jpg'
          }
        }
        creator.introduction = creator.introduction.split("。")[0] + "。"
      })

      result.Creators = creators

      // return res.json(result)
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

      // return res.json(exhibitionImages)
      res.render('exhibition_images', { exhibition: exhibitionImages })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

}

module.exports = exhibitionController