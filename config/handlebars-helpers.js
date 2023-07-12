const dayjs = require('dayjs')

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
  },
  ifEqual: function (data1, data2, options) {
    if (data1 === data2) return options.fn(this)
    return options.inverse(this)
  },
  toggleOptions: function (searchings, options) {
    if (searchings?.height || searchings?.width || searchings?.depth || searchings?.shape || searchings?.year) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  ifWeekLater: function(date, options) {
    date = new Date(date)
    let nextWeek = dayjs().add(1, 'week')
  
    if (date.valueOf() >= nextWeek.valueOf()) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
}
