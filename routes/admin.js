const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const upload = require('../middleware/multer')

router.get('/exhibitions', adminController.getExhibitions)
router.post('/exhibitions', adminController.postExhibition)
router.get('/exhibitions/create', adminController.editExhibition)

router.get('/exhibitions/:exhibitionId', adminController.getExhibition)
router.get('/exhibitions/:exhibitionId/edit', adminController.editExhibition)
router.put('/exhibitions/:exhibitionId', adminController.putExhibition)
router.get('/exhibitions/:exhibitionId/artworks', adminController.getExhibitionArtworks)
router.get('/exhibitions/:exhibitionId/select_artworks', adminController.selectExhibitionArtworks)
router.put('/exhibitions/:exhibitionId/artworks', adminController.putExhibitionArtworks)
router.delete('/exhibitions/:exhibitionId/artworks', adminController.deleteExhibitionArtworks)
router.put('/exhibitions/:exhibitionId/togglePrivacy', adminController.togglePrivacy)

router.put('/exhibitions/:exhibitionId/images', upload.array('exhImage', 10), adminController.putExhibitionImages)
router.delete('/exhibitions/:exhibitionId/images', adminController.deleteExhibitionImages)


module.exports = router