const db = require('../models')
const { Reservation, Collection } = db
const { Op } = require('sequelize')

const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isBetween)
dayjs.tz.setDefault('Asia/Taipei')

const reservationService = {
  getReservation: async (userId, reservationId) => {
    const reservation = await Reservation.findByPk(reservationId, {
      where: { UserId: userId },
      attributes: ['id', 'UserId', 'contact_person', 'phone', 'time', 'visitor_num', 'purpose', 'description', 'work_count'],
      include: { model: Collection, attributes: ['id', 'name'] },
      raw: true, nest: true
    })

    reservation.date = dayjs.tz(reservation.time).format('YYYY-MM-DD')  // '2023-07-28'
    reservation.time = dayjs.tz(reservation.time).format('HH:mm')       // '16:30'

    return reservation
  },
  getMonthReservations: async() => {
    try {
      // date limit within 1 month:  { min: tomorrow, max: nextMonth }
      const date_limit = getDateLimit()

      // find available date & slot
      const reservedDates = await Reservation.findAll({
        where: { time: { 
          [Op.between]: [date_limit.min, date_limit.max] 
        } },
        attributes: ['id', 'time'],
        raw: true
      })

      return reservedDates
    } catch (error) {
      console.log(error)
    }
  },
  getDateLimit
}

function getDateLimit() {
  const tomorrow = dayjs.tz().add(1, 'day').format('YYYY-MM-DD')
  const nextMonth = dayjs.tz().add(1, 'month').format('YYYY-MM-DD')
  const date_limit = { min: tomorrow, max: nextMonth }
  return date_limit
}

module.exports = reservationService