const { imgurFileHandler } = require('../helpers/file-helpers')
const db = require('../models');
const { Artwork, Exhibition, ExhibitionImage, Medium, Artist, ArtistImage, ArtworkImage, ArtworkArtist, ArtworkSubject, ExhibitionArtwork, Subject } = db
const { Op } = require('sequelize')
const sequelize = require('sequelize')
const IMAGE_NOT_AVAILABLE = 'https://i.imgur.com/nVNO3Kj.png'

const adminArtistController = {
  getArtists: async (req, res, next) => {
    try {
      const artists_rawData = await Artist.findAll({
        attributes: {
          include: [[sequelize.literal(`(
            SELECT COUNT (*) FROM artworkArtists AS aa WHERE aa.ArtistId = artist.id
          )`), 'workCount'],
          [sequelize.literal(`(
            SELECT COUNT (*) FROM artistImages AS ai WHERE ai.ArtistId = artist.id
          )`), 'imageCount']],
          exclude: ['createdAt', 'updatedAt']
        }
      })
      const artists = JSON.parse(JSON.stringify(artists_rawData))
      artists.forEach(artist => {
        artist.introduction = artist.introduction.slice(0, 50) + '...'
      })
      return res.render('admin/artists', { artists })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
}


module.exports = adminArtistController