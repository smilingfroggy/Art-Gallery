const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const { authenticated } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')
const passport = require('../config/passport')

router.get('/signup', (req, res) => res.render('signup'))
router.post('/signup', userController.signUp)
router.get('/login', (req, res) => res.render('login'))
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }) , userController.login)
router.post('/logout', userController.logout)
router.use('/', generalErrorHandler)


module.exports = router;
