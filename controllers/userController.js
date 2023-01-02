const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Collection } = db
const helpers = require('../helpers/auth-helpers')
const userService = require('../services/userService')

const userController = {
  signUp: async (req, res, next) => {
    try {
      await userService.signUp(req)
      req.flash('success_messages', 'Registered Successfully')
      return res.redirect('/user/login')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  login: async (req, res, next) => {
    req.flash('success_messages', 'Log in successfully')
    res.redirect('/artworks')
  },
  logout: (req, res, next) => {
    try {
      req.flash('success_messages', 'Log out successfully')
      req.logOut(() => res.redirect('/user/login'));
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getProfile: async (req, res, next) => {
    try {
      const user = helpers.getUser(req)
      return res.render('profile', user )
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  putProfile: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req).id
      const { name, password, passwordCheck } = req.body
      if (!name || !password || !passwordCheck) throw new Error('Please provide complete messages')
      if (password !== passwordCheck) throw new Error('Passwords do not match')

      await User.update({
        name,
        password: bcrypt.hashSync(password, 10)
      },{
        where: { id: userId }
      })

      req.flash('success_messages', 'Updated Successfully')
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}


module.exports = userController