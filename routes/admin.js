const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { authenticatedAdmin } = require('../middleware/auth')
const upload = require('../middleware/multer')
const { generalErrorHandler } = require('../middleware/error-handler')

router.get('/exhibitions', authenticatedAdmin, adminController.getExhibitions)
router.post('/exhibitions', authenticatedAdmin, adminController.postExhibition)
router.get('/exhibitions/create', authenticatedAdmin, adminController.editExhibition)

router.get('/exhibitions/:exhibitionId', authenticatedAdmin, adminController.getExhibition)
router.get('/exhibitions/:exhibitionId/edit', authenticatedAdmin, adminController.editExhibition)
router.put('/exhibitions/:exhibitionId', authenticatedAdmin, adminController.putExhibition)
router.delete('/exhibitions/:exhibitionId', authenticatedAdmin, adminController.deleteExhibition)

router.get('/exhibitions/:exhibitionId/artworks', authenticatedAdmin, adminController.getExhibitionArtworks)
router.get('/exhibitions/:exhibitionId/select_artworks', authenticatedAdmin, adminController.selectExhibitionArtworks)
router.put('/exhibitions/:exhibitionId/artworks', authenticatedAdmin, adminController.putExhibitionArtworks)
router.delete('/exhibitions/:exhibitionId/artworks', authenticatedAdmin, adminController.deleteExhibitionArtworks)
router.put('/exhibitions/:exhibitionId/togglePrivacy', authenticatedAdmin, adminController.togglePrivacy)

router.put('/exhibitions/:exhibitionId/images', authenticatedAdmin, upload.array('exhImage', 10), adminController.putExhibitionImages)
router.delete('/exhibitions/:exhibitionId/images', authenticatedAdmin, adminController.deleteExhibitionImages)
router.use('/', generalErrorHandler)

module.exports = router