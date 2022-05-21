const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  async function (req, email, password, done) {
    const user = await User.findOne({ where: { email } })
    if (!user) return done(null, false, req.flash('error_messages', 'Wrong email or password.'))

    const pwCheck = bcrypt.compareSync(password, user.password)
    if (!pwCheck) {
      return done(null, false, req.flash('error_messages', 'Wrong email or password.'))
    }
    return done(null, user)
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser( async (id, done) => {
  const user_rawData = await User.findByPk(id)
  const user = user_rawData.toJSON()
  return done(null, user)
})


module.exports = passport