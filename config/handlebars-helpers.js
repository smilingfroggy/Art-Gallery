module.exports = { 
  compareLength: function (artworks, num, options) {
    if (artworks.length > num) return options.fn(this)
    return options.inverse(this)
  }
}
