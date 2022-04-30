const db = require('../../models');
const Artwork = db.Artwork
const ArtworkImage = db.ArtworkImage
const Exhibition = db.Exhibition
const ExhibitionImage = db.ExhibitionImage
const Medium = db.Medium
const Artist = db.Artist
const ArtistImage = db.ArtistImage

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
  getExhibitionArtwork: async (req, res) => {
    try {
      const exhibition_rawData = await Exhibition.findByPk(req.params.exhibitionId, {
        include: [
          { model: ExhibitionImage, attributes: ['url', 'type', 'description'] },
          {
            model: Artwork, as: 'ContainedArtworks', attributes: ['id', 'artistName', 'name'],
            through: { attributes: [] },
            include: [
              { model: Medium, attributes: ['name'] },
              { model: ArtworkImage, attributes: ['url', 'type', 'description'] },
            ]
          },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      })

      let result = exhibition_rawData.toJSON()
      result.ContainedArtworks.forEach(work => {
        work.medium = work.Medium.name
        work.image = work.ArtworkImages[0] ? work.ArtworkImages[0].url : 'https://i.imgur.com/nVNO3Kj.png'  // if no image in DB, use "no image"
        delete work.Medium
        delete work.ArtworkImages
      })
      return res.json(result)
    } catch (error) {
      console.log(error)
    }

  },
  getExhibitionArtists: async (req, res) => {
    try {
      const exhibitionArtists_rawData = await Exhibition.findByPk(req.params.exhibitionId, {
        where: { 'privacy': 2 },
        attributes: ['id', 'name'],
        include: {
          model: Artwork, as: 'ContainedArtworks',
          attributes: ['id'],
          through: { attributes: [] },
          include: {
            model: Artist, as: 'Creators', through: { attributes: [] },
            attributes: ['id', 'name', 'birthYear', 'deathYear', 'introduction'],
            include: { model: ArtistImage, attributes: { exclude: ['createdAt', 'updatedAt'] } }
          }
        },
      })

      if (!exhibitionArtists_rawData) {
        return res.json({ status: 'failure', message: 'No artists found!' })
      }
      // 去除重複的創作者；每件作品創作者可能不同、每件作品可有多個創作者
      const creators = []
      exhibitionArtists_rawData.toJSON().ContainedArtworks.forEach(work => {
        work.Creators.forEach(creator => {
          if (!creators.find(creator_added => creator_added.id === creator.id)) {
            creators.push(creator)
          }
        })
      })

      return res.json(creators)

    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = exhibitionController