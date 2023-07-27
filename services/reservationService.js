const db = require('../models')
const { Reservation, Collection } = db
const { Op } = require('sequelize')
const dateHelpers = require('../helpers/date-helpers')

const reservationService = {
  getReservation: async (userId, reservationId) => {
    const reservation = await Reservation.findByPk(reservationId, {
      where: { UserId: userId },
      attributes: ['id', 'UserId', 'contact_person', 'phone', 'time', 'visitor_num', 'purpose', 'description', 'work_count'],
      include: { model: Collection, attributes: ['id', 'name'] },
      raw: true, nest: true
    })

    reservation.date = dateHelpers.getDateString(reservation.time) // YYYY/MM/DD
    reservation.time = dateHelpers.getTimeString(reservation.time) // HH:mm
    return reservation
  },
  getMonthReservations: async() => {
    try {
      const date_limit = dateHelpers.getDateLimit()

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
  }
}

module.exports = reservationService