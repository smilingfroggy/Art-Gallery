const db = require('../../models');
const Artwork = db.Artwork
const Exhibition = db.Exhibition
const ExhibitionImage = db.ExhibitionImage
const Medium = db.Medium
const Artist = db.Artist

const exhibitionController = {
  getExhibitions: async (req, res) => {
    try {
      const exhibitions_rawData = await Exhibition.findAll({
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
        return {
          ...exhibition.dataValues,
          artwork_sum: count
        }
      })
      return res.json(exhibitionsData)
    } catch (error) {
      console.log(error)
    }
  },
  getExhibition: async (req, res) => {
    try {
      const exhibition_rawData = await Exhibition.findByPk(req.params.exhibitionId, {
        include: [
          { model: ExhibitionImage, attributes: ['url', 'type', 'description'] },
          {
            model: Artwork, as: 'ContainedArtworks', attributes: ['id', 'artistName', 'name'], through: { attributes: [] },
            include: { model: Medium, attributes: ['name'] }
          },
          // TO ADD: artwork image
        ],   // limit:10 - Error: Only HasMany associations support include.separate
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      })

      let result = exhibition_rawData.toJSON()
      result.ContainedArtworks.forEach(work => {
        work.medium = work.Medium.name
        delete work.Medium
      })
      return res.json(result)
    } catch (error) {
      console.log(error)
    }

  }
}

module.exports = exhibitionController