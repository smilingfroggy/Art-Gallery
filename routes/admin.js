const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.get('/exhibitions', adminController.getExhibitions)
router.put('/exhibitions/:exhibitionId/togglePrivacy', adminController.togglePrivacy)


module.exports = router