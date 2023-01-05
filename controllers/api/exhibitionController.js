const exhibitionService = require('../../services/exhibitionService')

const exhibitionController = {
  getExhibitions: async (req, res, next) => {
    try {
      let exhibitionsData = await exhibitionService.getExhibitions(req, res)
      return res.json(exhibitionsData)
    } catch (error) {
      next(error)
    }
  },
  getExhibition: async (req, res, next) => {
    try {
      console.log('controller getExhibition')
      const result = await exhibitionService.getExhibition(req, res)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  },
  getExhibitionArtwork: async (req, res, next) => {
    try {
      const result = await exhibitionService.getExhibitionArtworks(req, res)
      return res.json(result)
    } catch (error) {
      next(error)
    }

  },
  getExhibitionArtists: async (req, res, next) => {
    try {
      const creators = await exhibitionService.getExhibitionArtists(req, res)
      return res.json(creators)
    } catch (error) {
      next(error)
    }
  },
  getExhibitionImages: async (req, res, next) => {
    try {
      const exhibitionImages = await exhibitionService.getExhibitionImages(req, res, next)
      return res.json(exhibitionImages)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = exhibitionController