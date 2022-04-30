const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/exhibitionController')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/exhibitions/', exhibitionController.getExhibitions)
router.get('/exhibitions/:exhibitionId', exhibitionController.getExhibitionInfo)
router.get('/exhibitions/:exhibitionId/artworks', exhibitionController.getExhibitionArtworks)
router.get('/exhibitions/:exhibitionId/images', exhibitionController.getExhibitionImages)

module.exports = router;
