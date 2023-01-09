const artistService = require('../../services/artistService')

const artistController = {
  getArtist: async (req, res, next) => {
    try {
      const artist = await artistService.getArtist(req, res)
      return res.json({ status: 'success', data: artist })
    } catch (error) {
      next(error)
    }
  },
  getArtistImages: async (req, res, next) => {
    try {
      const artistImages = await artistService.getArtistImages(req, res)
      return res.json({ status: 'success', data: artistImages})
    } catch (error) {
      next(error)
    }
  }
}

module.exports = artistController