const express = require('express')
const router = express.Router()
const adminExhController = require('../../../controllers/adminExhController')
const adminArtworkController = require('../../../controllers/adminArtworkController')
const adminArtistController = require('../../../controllers/adminArtistController')
const { authenticatedAdmin } = require('../../../middleware/auth')
const upload = require('../../../middleware/multer')
const { generalErrorHandler } = require('../../../middleware/error-handler')

router.get('/exhibitions', authenticatedAdmin, adminExhController.getExhibitions)
router.post('/exhibitions', authenticatedAdmin, adminExhController.postExhibition)
router.get('/exhibitions/create', authenticatedAdmin, adminExhController.editExhibition)

router.get('/exhibitions/:exhibitionId', authenticatedAdmin, adminExhController.getExhibition)
router.get('/exhibitions/:exhibitionId/edit', authenticatedAdmin, adminExhController.editExhibition)
router.put('/exhibitions/:exhibitionId', authenticatedAdmin, adminExhController.putExhibition)
router.delete('/exhibitions/:exhibitionId', authenticatedAdmin, adminExhController.deleteExhibition)

router.get('/exhibitions/:exhibitionId/artworks', authenticatedAdmin, adminExhController.getExhibitionArtworks)
router.get('/exhibitions/:exhibitionId/select_artworks', authenticatedAdmin, adminExhController.selectExhibitionArtworks)
router.put('/exhibitions/:exhibitionId/artworks', authenticatedAdmin, adminExhController.putExhibitionArtworks)
router.delete('/exhibitions/:exhibitionId/artworks', authenticatedAdmin, adminExhController.deleteExhibitionArtworks)
router.put('/exhibitions/:exhibitionId/togglePrivacy', authenticatedAdmin, adminExhController.togglePrivacy)

router.put('/exhibitions/:exhibitionId/images', authenticatedAdmin, upload.array('exhImage', 10), adminExhController.putExhibitionImages)
router.delete('/exhibitions/:exhibitionId/images', authenticatedAdmin, adminExhController.deleteExhibitionImages)

router.get('/artworks', authenticatedAdmin, adminArtworkController.getArtworks)
router.post('/artworks', authenticatedAdmin, upload.array('image', 10), adminArtworkController.postArtworks)
router.get('/artworks/create', authenticatedAdmin, adminArtworkController.editArtworks)
router.get('/artworks/:artworkId', authenticatedAdmin, adminArtworkController.getArtwork)
router.get('/artworks/:artworkId/edit', authenticatedAdmin, adminArtworkController.editArtworks)
router.put('/artworks/:artworkId', authenticatedAdmin, upload.array('image', 10), adminArtworkController.putArtworks)
router.delete('/artworks/:artworkId', authenticatedAdmin, adminArtworkController.deleteArtwork)
router.delete('/artworks/:artworkId/images', authenticatedAdmin, adminArtworkController.deleteArtworkImages)

router.get('/artists', authenticatedAdmin, adminArtistController.getArtists)
router.get('/artists/:artistId', authenticatedAdmin, adminArtistController.getArtist)
router.post('/artists', authenticatedAdmin, upload.array('image', 10), adminArtistController.postArtist)
router.put('/artists/:artistId', authenticatedAdmin, upload.array('image', 10), adminArtistController.putArtist)
router.delete('/artists/:artistId', authenticatedAdmin, adminArtistController.deleteArtist)
router.delete('/artists/:artistId/images', authenticatedAdmin, adminArtistController.deleteArtistImages)

router.use('/', generalErrorHandler)

module.exports = router