const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Collection } = db
const mailChecker = require('mailchecker')

const userService = {
  signUp: async (req) => {
    const { name, password, passwordCheck, email } = req.body
    if (!name || !password || !passwordCheck || !email) throw new Error('Please provide complete messages')
    if (password !== passwordCheck) throw new Error('Passwords do not match')
    if (password.length < 6) throw new Error('Password must be at least 6 characters')
    if (name.length > 20) throw new Error('Name is too long')
    if (!mailChecker.isValid(email)) throw new Error('Invalid email address')

    // check if email has been registered
    const userRecord = await User.findOne({
      where: { email }
    })
    if (userRecord) throw new Error('Email has been registered')

    // create new user and default collection
    const newUser = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
    })

    await Collection.create({
      UserId: newUser.id,
      name: 'Favorite List',
      privacy: 0
    })
  }
}

module.exports = userService