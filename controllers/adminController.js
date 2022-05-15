const { imgurFileHandler } = require('../helpers/file-helpers')
const db = require('../models');
const Artwork = db.Artwork
const Exhibition = db.Exhibition
const ExhibitionImage = db.ExhibitionImage
const Medium = db.Medium
const Artist = db.Artist
const ArtistImage = db.ArtistImage
const ArtworkImage = db.ArtworkImage

const adminController = {
  getExhibitions: async (req, res) => {
    try {
      const exhibitions_rawData = await Exhibition.findAll({
        include: [
          { model: ExhibitionImage, attributes: ['url', 'type', 'description'] },
          { model: Artwork, as: 'ContainedArtworks', attributes: ['id'], through: { attributes: [] } },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      })

      let exhibitionsData = exhibitions_rawData.map(exhibition => {
        let artwork_sum = exhibition.ContainedArtworks.length
        delete exhibition.dataValues.ContainedArtworks
        let image_sum = exhibition.dataValues.ExhibitionImages.length
        delete exhibition.dataValues.ExhibitionImages
        return {
          ...exhibition.dataValues,
          date_start: exhibition.dataValues.date_start.toISOString().slice(0, 10),
          date_end: exhibition.dataValues.date_end.toISOString().slice(0, 10),
          introduction: exhibition.dataValues.introduction.slice(0, 55) + "...",
          image_sum,
          artwork_sum
        }
      })
      // return res.json(exhibitionsData)
      return res.render('admin/exhibitions', { exhibitionsData })
    } catch (error) {
      console.log(error)
    }
  },
  togglePrivacy: async (req, res) => {
    try {
      const { exhibitionId } = req.params
      const { privacy } = req.body
      await Exhibition.update({ privacy: (Number(privacy) ? 0 : 2) }, {
        where: { id: exhibitionId },
      })
      return res.redirect('back')
    } catch (error) {
      console.log(error)
    }
  },
  getExhibition: async (req, res) => {
    try {
      const exhibition_rawData = await Exhibition.findByPk(req.params.exhibitionId, {
        include: [
          { model: ExhibitionImage, attributes: ['id', 'url', 'type', 'description'] },
          {
            model: Artwork, as: 'ContainedArtworks',
            attributes: { exclude: ['piecesNum', 'viewCount', 'createdAt', 'updatedAt', 'introduction'] },
            through: { attributes: [] },
            include: [
              { model: ArtworkImage, attributes: ['id', 'url', 'type'] },
              { model: Medium, attributes: ['name'] }
            ]
          },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      })

      if (!exhibition_rawData) {
        return res.send('Oops! Exhibition unavailable!')
      }

      let result = exhibition_rawData.toJSON()
      result.artwork_sum = result.ContainedArtworks.length
      result.date_start = result.date_start.toISOString().slice(0, 10)
      result.date_end = result.date_end.toISOString().slice(0, 10)

      // console.log(result.ContainedArtworks) 
      let usePoster = result.ExhibitionImages.find(images => images.type === 'poster').url
      result.poster = usePoster

      // ContainedArtworks
      result.ContainedArtworks.forEach(work => {
        work.creationTime = work.creationTime ? work.creationTime.toISOString().slice(0, 4) : null
        if (!work.ArtworkImages.length) work.ArtworkImages.push({ url: 'https://i.imgur.com/nVNO3Kj.png' })
      })

      // return res.json(result)
      return res.render('admin/exhibition', { exhibition: result })
    } catch (error) {
      console.log(error)
    }
  },
  putExhibitionImage: async (req, res) => {
    try {
      const { exhibitionId } = req.params
      const { file } = req
      const { type, description } = req.body

      Promise.all([
        Exhibition.findByPk(exhibitionId),
        imgurFileHandler(file)
      ])
        .then(([exhibition, filePath]) => {
          if (!exhibition) throw new Error('Exhibition does not exist!')
          ExhibitionImage.create({
            ExhibitionId: exhibitionId,
            url: filePath,
            type,
            description
          })
          .then(() => {
            res.redirect('back')
          })
        })
    } catch (error) {
      console.log(error)
    }
  },
  getExhibitionArtworks: async (req, res) => {
    try {
      const exhibitionArtworks_rawData = await Exhibition.findByPk(req.params.exhibitionId, {
        attributes: ['id', 'name'],
        include: {
          model: Artwork, as: 'ContainedArtworks',
          attributes: { exclude: ['piecesNum', 'viewCount', 'createdAt', 'updatedAt', 'introduction'] },
          through: { attributes: [] },
          include: [
            { model: Medium, attributes: ['name'] },
            { model: ArtworkImage, attributes: ['id', 'url'] },
          ]
        },
      })

      if (!exhibitionArtworks_rawData) {
        return res.send('Oops! Exhibition artwork unavailable!')
      }

      let result = exhibitionArtworks_rawData.toJSON()
      result.ContainedArtworks.forEach(work => {
        work.creationTime = work.creationTime ? work.creationTime.toISOString().slice(0, 4) : null
        if (!work.ArtworkImages.length) work.ArtworkImages.push({ url: 'https://i.imgur.com/nVNO3Kj.png' })  // if no image in DB, use "no image"
      })

      // return res.json(result)
      return res.render('admin/exhibition_artworks', { exhibition: result })
    } catch (error) {
      console.log(error)
    }
  },

}

module.exports = adminController