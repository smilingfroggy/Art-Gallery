const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/api/exhibitionController')

router.get('/exhibitions/', exhibitionController.getExhibitions)
router.get('/exhibitions/:exhibitionId', exhibitionController.getExhibitionArtwork)
router.get('/exhibitions/:exhibitionId/artists', exhibitionController.getExhibitionArtists)

module.exports = router;
