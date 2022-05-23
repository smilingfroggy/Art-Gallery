const { ensureAuthenticated, getUser } = require('../helpers/auth-helpers')

const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) return next()
  req.flash('error_messages', 'Please login first!')
  res.redirect('/user/login')
}

const authenticatedAdmin = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    if (getUser(req).isAdmin) return next()
    req.flash('error_messages', 'Permission denies')
    return res.redirect('/')
  } else {
    req.flash('error_messages', 'Please login first!')
    return res.redirect('/user/login')
  }
}

module.exports = {
  authenticated,
  authenticatedAdmin
}