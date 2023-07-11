const express = require('express');
const router = express.Router();
const admin = require('./modules/admin')
const user = require('./modules/user')
const auth = require('./modules/auth')
const artworkController = require('../../controllers/artworkController')
const artistController = require('../../controllers/artistController')
const collectionController = require('../../controllers/collectionController')
const exhibitionController = require('../../controllers/exhibitionController')
const reservationController = require('../../controllers/reservationController')
const { authenticated } = require('../../middleware/auth')
const { generalErrorHandler } = require('../../middleware/error-handler')

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

router.get('/collections', collectionController.getCollections)
router.post('/collections', authenticated, collectionController.postCollection)
router.get('/collections/:collectionId', collectionController.getCollection)
router.put('/collections/:collectionId', authenticated, collectionController.putCollection)
router.delete('/collections/:collectionId', authenticated, collectionController.deleteCollection)
router.post('/collections/favorite/:artworkId', authenticated, collectionController.addFavorite)
router.delete('/collections/favorite/:artworkId', authenticated, collectionController.deleteFavorite)
router.put('/collections/artworks/:artworkId', authenticated, collectionController.putCollectionArtworks)

router.get('/reservations', authenticated, reservationController.getReservations)
router.get('/reservations/create', authenticated, reservationController.createReservation)
router.post('/reservations', authenticated, reservationController.postReservation)
router.use('/user', user)
router.use('/admin', admin)
router.use('/auth', auth)

router.use('/', generalErrorHandler)

module.exports = router;
