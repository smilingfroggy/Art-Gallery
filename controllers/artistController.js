const artistService = require('../services/artistService')

const artistController = {
  getArtist: async (req, res, next) => {
    try {
      const artist = await artistService.getArtist(req, res)
      return res.render('artist', { artist })
    } catch(error) {
      console.log(error)
      next(error)
    }
  }
}


module.exports = artistController