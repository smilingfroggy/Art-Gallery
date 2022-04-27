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
          date_start: exhibition.dataValues.date_start.toISOString().slice(0,10),
          date_end: exhibition.dataValues.date_end.toISOString().slice(0, 10),
          introduction: exhibition.dataValues.introduction.slice(0,55) + "...",
          ExhibitionImages: useImage,
          artwork_sum: count
        }
      })
      return res.render('exhibitions', { exhibitionsData })
    } catch (error) {
      console.log(error)
    }
  },
  
}

module.exports = exhibitionController