const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.get('/exhibitions', adminController.getExhibitions)
router.get('/exhibitions/:exhibitionId', adminController.getExhibition)
router.get('/exhibitions/:exhibitionId/artworks', adminController.getExhibitionArtworks)
router.put('/exhibitions/:exhibitionId/togglePrivacy', adminController.togglePrivacy)


module.exports = router