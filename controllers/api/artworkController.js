const artworkService = require('../../services/artworkService')

const artworkController = {
  getSelections: async (req, res, next) => {
    try {
      const selections = await artworkService.getSelections()
      return res.json({ status: 'success', data: selections })  
    } catch (error) {
      next(error)
    }
  },
  getArtworks: async (req, res, next) => {
    try {
      // check if req.query is empty
      let hasQuery = Object.values(req.query).some(val => val != '')
      if (!hasQuery) {
        return res.json({ status: 'success', message: 'Nothing searched' })
      }

      const searchResult = await artworkService.getArtworks(req, res)
      let message = ""
      if (!searchResult.artwork_result.count) {
        message = 'No result. '
      }
      if (searchResult.warning_messages.length) {
        message = searchResult.warning_messages.reduce((a, b) => a + b.message, message ? message : "")
      }
      delete searchResult.warning_messages
      return res.json({ status: 'success', data: searchResult, message })
      
    } catch (error) {
      next(error)
    }
  },
  getArtwork: async (req, res, next) => {
    try {
      const artwork = await artworkService.getArtwork(req, res)
      return res.json({ status: 'success', data: artwork })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = artworkController