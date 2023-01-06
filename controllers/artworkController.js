const db = require('../models')
const { Artwork, Artist, ArtworkImage, Medium, Subject, } = db
const sequelize = require("sequelize")
const artworkService = require('../services/artworkService')

const artworkController = {
  getSelections: async (req, res, next) => {
    try {
      const selections_artist = await Artist.findAll({
        include: {
          model: Artwork, as: "Creations", through: { attributes: [] }, attributes: ['id', 'artistName'],
          include: { model: ArtworkImage, attributes: ['id', 'url'] }
        },
        attributes: ['id', 'name',
          [sequelize.fn('COUNT', sequelize.col('Creations.artistName')), 'workCount'],
        ],
        raw: true, nest: true, group: ['id'],
        order: [[sequelize.col('workCount'), 'DESC']]
      })

      const selections_medium = await Medium.findAll({
        include: {
          model: Artwork, attributes: ['id', 'name', 'MediumId'],
          include: { model: ArtworkImage, attributes: ['id', 'url'] }
        },
        attributes: ['id', 'name',
          [sequelize.fn('COUNT', sequelize.col('Artworks.MediumId')), 'workCount']
        ],
        raw: true, nest: true, group: ['id'],
        order: [[sequelize.col('workCount'), 'DESC']]
      })

      const selections_subject = await Subject.findAll({
        include: {
          model: Artwork, as: 'ContainedArtworks', attributes: ['id', 'name'], through: { attributes: [] },
          include: { model: ArtworkImage, attributes: ['id', 'url'] }
        },
        attributes: ['id', 'name',
          [sequelize.fn('COUNT', sequelize.col('ContainedArtworks.id')), 'workCount']
        ],
        raw: true, nest: true, group: ['id'],
        order: [[sequelize.col('workCount'), 'DESC']]
      })

      const selections = {
        artists: selections_artist,
        media: selections_medium,
        subjects: selections_subject
      }

      // return res.json(selections)
      return res.render('artworks', { selections })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getArtworks: async (req, res, next) => {
    try {
      if (!Object.keys(req.query).length) {   // if req.query is empty
        return res.render('artworks', { selections })
      }

      const results = await artworkService.getArtworks(req, res)
      return res.render('artworks', results)
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getArtwork: async (req, res, next) => {
    try {
      const artwork = await artworkService.getArtwork(req, res)
      if (artwork.height > artwork.width) {
        return res.render('artwork_portrait', { artwork })
      }
      return res.render('artwork_landscape', { artwork })

    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

module.exports = artworkController