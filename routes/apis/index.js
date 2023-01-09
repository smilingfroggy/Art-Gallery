const express = require('express');
const router = express.Router();
const passport = require('../../config/passport')
const userController = require('../../controllers/api/userController')
const collectionController = require('../../controllers/api/collectionController')
const artworkController = require('../../controllers/api/artworkController')
const artistController = require('../../controllers/api/artistController')
const exhibitionController = require('../../controllers/api/exhibitionController')
const subjectController = require('../../controllers/api/subjectController')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const { authenticated: authenticated_session, authenticatedAdmin: authenticatedAdmin_session } = require('../../middleware/auth')
const { apiErrorHandler } = require('../../middleware/api-error-handler')


router.post('/login', passport.authenticate('local', { session: false }), userController.login)
router.post('/signup', userController.signUp)

router.get('/exhibitions/', authenticated, exhibitionController.getExhibitions)
router.get('/exhibitions/:exhibitionId', authenticated, exhibitionController.getExhibition)
router.get('/exhibitions/:exhibitionId/artworks', authenticated, exhibitionController.getExhibitionArtwork)
router.get('/exhibitions/:exhibitionId/artists', authenticated, exhibitionController.getExhibitionArtists)
router.get('/exhibitions/:exhibitionId/images', authenticated, exhibitionController.getExhibitionImages)

router.get('/artworks', authenticated, artworkController.getSelections)
router.get('/artworks/search', authenticated, artworkController.getArtworks)
router.get('/artworks/:artworkId', authenticated, artworkController.getArtwork)

router.get('/artists/:artistId', authenticated, artistController.getArtist)

// for inner axios request:  '/api/session/collections'
router.get('/session/collections/', authenticated_session, collectionController.getOwnCollections)

router.post('/session/subjects', authenticatedAdmin_session, subjectController.postSubject)

router.use('/', apiErrorHandler)

module.exports = router;
