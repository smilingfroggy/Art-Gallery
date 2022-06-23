const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/api/collectionController')
const exhibitionController = require('../controllers/api/exhibitionController')
const subjectController = require('../controllers/api/subjectController')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')

router.get('/exhibitions/', exhibitionController.getExhibitions)
router.get('/exhibitions/:exhibitionId', exhibitionController.getExhibitionArtwork)
router.get('/exhibitions/:exhibitionId/artists', exhibitionController.getExhibitionArtists)

router.get('/collections/', authenticated, collectionController.getOwnCollections)
router.post('/subjects', authenticatedAdmin, subjectController.postSubject)
module.exports = router;
