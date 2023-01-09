const artistService = require('../../services/artistService')

const artistController = {
  getArtist: async (req, res, next) => {
    try {
      const artist = await artistService.getArtist(req, res)
      return res.json({ status: 'success', data: artist })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = artistController