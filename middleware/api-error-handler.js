module.exports = {
  apiErrorHandler (err, req, res, next) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode)
    if (err instanceof Error) {
      return res.json({ status: 'error', message: `${err.name}: ${err.message}` })
    } else {
      return res.json({ status: 'error'})
    }
  }
}