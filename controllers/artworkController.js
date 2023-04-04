const artworkService = require('../services/artworkService')

const artworkController = {
  getSelections: async (req, res, next) => {
    try {
      const selections = await artworkService.getSelections()

      // return res.json(selections)
      return res.render('artworks', { selections })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getArtworks: async (req, res, next) => {
    try {
      // check if req.query is empty
      let hasQuery = Object.values(req.query).some(val => val != '')
      if (!hasQuery) {
        req.flash('warning_messages', { message: 'Please select any option.' })
        return res.redirect('/artworks')
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