const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Collection, Artwork } = db
const { Strategy: JWTStrategy, ExtractJwt } = passportJWT

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

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    let userData = await User.findByPk(jwtPayload.id, {
      attributes: ['id', 'email', 'isAdmin'],
      include: {
        model: Collection, attributes: ['id', 'name'],
        where: { privacy: 2 }
      }
    })
    userData = userData.toJSON()
    return done(null, userData)
  } catch (err) {
    return done(err, false)
  }
}))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser( async (id, done) => {
  const user_rawData = await User.findByPk(id, {
    include: {
      model: Collection, attributes: ['id', 'name'],
      include: { model: Artwork, as: 'JoinedArtworks', attributes: ['id'], through: { attributes: [] } }
    }
  })

  const user = user_rawData.toJSON()
  user.addedArtworks = new Set()
  user.Collections.forEach(col => {
    if (col.name === 'Favorite List') {
      user.favoriteArtworks = col.JoinedArtworks.map(work => work.id)
    }
    col.JoinedArtworks.forEach(work => {
      user.addedArtworks.add(work.id)
    })
  })
  return done(null, user)
})


module.exports = passport