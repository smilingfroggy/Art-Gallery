const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.get('/exhibitions', adminController.getExhibitions)



module.exports = router