const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userController = {
  signUp: async (req, res, next) => {
    try {
      const { name, password, passwordCheck, email } = req.body
      if (!name || !password || !passwordCheck || !email) throw new Error('Please provide complete messages')
      if (password !== passwordCheck) throw new Error('Passwords do not match')

      // check if email has been registered
      const userRecord = await User.findOne({
        where: { email }
      })
      if (userRecord) throw new Error('Email has been registered')

      // create new user
      await User.create({
        name, 
        email,
        password: bcrypt.hashSync(password, 10),
      })

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
  }
}


module.exports = userController