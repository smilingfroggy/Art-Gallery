module.exports = {
  generalErrorHandler (err, req, res, next) {
    if (err instanceof Error) {
      req.flash('error_messages', `${err.name}: ${err.message}`)
    } else {
      req.flash('error_messages', err )
    }
    return res.redirect('back')
  },
  adminErrorHandler (err, req, res, next) {
    if (err instanceof Error) {
      req.flash('error_messages', `${err.name}: ${err.message}`)
    } else {
      req.flash('error_messages', err)
    }
    if (req.get('Referer')) return res.redirect('back')
    return res.redirect('/admin/artworks')
  },
  apiErrorHandler(err, req, res, next) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode)
    if (err instanceof Error) {
      return res.json({ status: 'error', message: `${err.name}: ${err.message}` })
    } else {
      return res.json({ status: 'error' })
    }
  }
}