const exhibitionService = require('../services/exhibitionService')

const exhibitionController = {
  getExhibitions: async (req, res, next) => {
    try {
      let exhibitionsData = await exhibitionService.getExhibitions(req, res)
      return res.render('exhibitions', { exhibitionsData })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getExhibitionInfo: async (req, res, next) => {
    try {
      const result = await exhibitionService.getExhibition(req, res)
      return res.render('exhibition_info', { exhibition: result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getExhibitionArtworks: async (req, res, next) => {
    try {
      const result = await exhibitionService.getExhibitionArtworks(req, res)
      const Creators = await exhibitionService.getExhibitionArtists(req, res)
      result.Creators = Creators

      return res.render('exhibition_artworks', { exhibition: result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getExhibitionImages: async (req, res, next) => {
    try {
      const exhibitionImages = await exhibitionService.getExhibitionImages(req, res)
    
      return res.render('exhibition_images', { exhibition: exhibitionImages })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

}

module.exports = exhibitionController