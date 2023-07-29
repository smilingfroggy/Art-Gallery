const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isBetween)
dayjs.tz.setDefault('Asia/Taipei')

function getDateLimit() {
  const tomorrow = dayjs.tz().add(1, 'day').format('YYYY-MM-DD')
  const nextMonth = dayjs.tz().add(1, 'month').format('YYYY-MM-DD')
  const date_limit = { min: tomorrow, max: nextMonth }
  return date_limit
}

module.exports = {
  getDateString: (date) => {   // JS Date object
    let time = dayjs.tz(date)
    return time.format('YYYY-MM-DD')
  },
  getTimeString: (date) => {
    let time = dayjs.tz(date)
    return time.format('HH:mm')
  },
  getDateTimeString: (date) => {
    let time = dayjs.tz(date)
    return time.format('YYYY/MM/DD HH:mm')
  },
  getDateObj: (dateStr) => {
    return dayjs.tz(dateStr)
  },
  checkWithinMonth: (date) => {   // Dayjs obj
    const date_limit = getDateLimit()
    return date.isBetween(date_limit.min, date_limit.max)
  },
  checkWithinWeek: (date) => {
    return date < dayjs().add(1, 'week')
  },
  getDateLimit
}