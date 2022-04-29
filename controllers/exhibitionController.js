const db = require('../models');
const Artwork = db.Artwork
const Exhibition = db.Exhibition
const ExhibitionImage = db.ExhibitionImage
const Medium = db.Medium
const Artist = db.Artist

const exhibitionController = {
  getExhibitions: async (req, res) => {
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
        let useImage = exhibition.dataValues.ExhibitionImages.find(images => images.type === 'poster').url
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
    }
  },
  getExhibitionInfo: async (req, res) => {
    try {
      const exhibition_rawData = await Exhibition.findByPk(req.params.exhibitionId, {
        where: { 'privacy': 2 },
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

      if (!exhibition_rawData) {
        return res.send('Oops! Exhibition unavailable!')
      }

      let result = exhibition_rawData.toJSON()
      const count_work = result.ContainedArtworks.length
      result.artwork_sum = count_work

      // console.log(result.ContainedArtworks) 
      let usePoster = result.ExhibitionImages.find(images => images.type === 'poster').url
      result.poster = usePoster

      // return res.json(result)
      return res.render('exhibition_info', { exhibition: result })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = exhibitionController