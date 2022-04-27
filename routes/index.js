const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/exhibitionController')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/exhibitions/', exhibitionController.getExhibitions)
module.exports = router;
