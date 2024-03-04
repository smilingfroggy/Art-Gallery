const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook').Strategy 
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
    if (userData) {
      userData = userData.toJSON()
      return done(null, userData)
    }
    return done(null, false)
  } catch (err) {
    return done(err, false)
  }
}))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  const user_rawData = await User.findByPk(id, {
    attributes: ['id', 'email', 'isAdmin'],
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
  console.log('==== deserializeUser ====')
  return done(null, user)
})

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK,
  profileFields: ['email', 'displayName']
},
  async function(accessToken, refreshToken, profile, done) {
    try {
      const { email, name } = profile._json
      if (!email) throw new Error('Invalid email. Please try again to create account.')
      let user = await User.findOne({ where: { email }})
      if (user) return done(null, user)

      // create new user and default collection
      let randomPW = Math.random().toString(36).slice(-8)
      let password = await bcrypt.hash(randomPW, 10)
      user = await User.create({
        name, email, password, isAdmin: 0
      })
      await Collection.create({
        UserId: user.id,
        name: 'Favorite List',
        privacy: 0
      })
      return done(null, user)
    } catch (error) {
      done(error, false)
    }
  }
))

module.exports = passport