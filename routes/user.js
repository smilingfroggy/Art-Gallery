const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const { generalErrorHandler } = require('../middleware/error-handler')

/* GET users listing. */
router.get('/signup', (req, res) => res.render('signup'))
router.post('/signup', userController.signUp)
router.get('/login', (req, res) => res.render('login'))

router.use('/', generalErrorHandler)


module.exports = router;
