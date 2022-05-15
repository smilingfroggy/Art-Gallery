const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const upload = require('../middleware/multer')

router.get('/exhibitions', adminController.getExhibitions)
router.get('/exhibitions/:exhibitionId', adminController.getExhibition)
router.get('/exhibitions/:exhibitionId/artworks', adminController.getExhibitionArtworks)
router.put('/exhibitions/:exhibitionId/togglePrivacy', adminController.togglePrivacy)

router.put('/exhibitions/:exhibitionId/images', upload.single('exhImage'), adminController.putExhibitionImage)
router.delete('/exhibitions/:exhibitionId/images', adminController.deleteExhibitionImages)


module.exports = router