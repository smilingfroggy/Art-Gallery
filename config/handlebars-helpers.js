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
  },
  // find selected creators of artwork
  ifInclude: function (data, arrayData, options) {
    if (arrayData.find(element => element.name === data)) return options.fn(this)
    return options.inverse(this)
  }
}
