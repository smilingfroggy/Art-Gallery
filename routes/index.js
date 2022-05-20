const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/exhibitionController')
const artworkController = require('../controllers/artworkController')
const artistController = require('../controllers/artistController')
const { generalErrorHandler } = require('../middleware/error-handler')

/* GET home page. */
router.get('/', exhibitionController.getExhibitions)

router.get('/exhibitions/', exhibitionController.getExhibitions)
router.get('/exhibitions/:exhibitionId', exhibitionController.getExhibitionInfo)
router.get('/exhibitions/:exhibitionId/artworks', exhibitionController.getExhibitionArtworks)
router.get('/exhibitions/:exhibitionId/images', exhibitionController.getExhibitionImages)

router.get('/artworks', artworkController.getSelections)
router.get('/artworks/search', artworkController.getArtworks)
router.get('/artworks/:artworkId', artworkController.getArtwork)

router.get('/artists/:artistId', artistController.getArtist)
router.use('/', generalErrorHandler)

module.exports = router;
