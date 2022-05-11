module.exports = { 
  compareLength: function (artworks, num, options) {
    if (artworks.length > num) return options.fn(this)
    return options.inverse(this)
  },
  noResult: function (count, options) {
    if (count === 0) return options.fn(this)
    return options.inverse(this)
  },
  passNoResult: function (count, options) {
    if (count > 0) return options.fn(this)
    return options.inverse(this)
  }
}
