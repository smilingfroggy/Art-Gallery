module.exports = {
  apiErrorHandler (err, req, res, next) {
    if (err instanceof Error) {
      return res.json({ status: 'error', message: `${err.name}: ${err.message}` })
    } else {
      return res.json({ status: 'error'})
    }
  }
}