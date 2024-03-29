const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/userController')
const { authenticated } = require('../../../middleware/auth')
const { generalErrorHandler } = require('../../../middleware/error-handler')
const verifyCaptcha = require('../../../middleware/recaptcha')
const passport = require('../../../config/passport')

router.get('/signup', (req, res) => res.render('signup'))
router.post('/signup', userController.signUp)
router.get('/login', (req, res) => res.render('login'))
router.post('/login', passport.authenticate('local', { failureRedirect: '/user/login', failureMessage: true }), userController.login)
router.post('/logout', userController.logout)
router.get('/profile', authenticated, userController.getProfile)
router.put('/profile', authenticated, userController.putProfile)
router.get('/forgot-password', (req, res) => res.render('forgot_password', { RECAPTCHA_SITEKEY: process.env.RECAPTCHA_SITEKEY }))
router.post('/forgot-password', verifyCaptcha, userController.forgotPassword)
router.get('/reset-password', (req, res) => res.render('reset_password'))
router.post('/reset-password', userController.resetPassword)
router.use('/', generalErrorHandler)


module.exports = router;
