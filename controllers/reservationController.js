const db = require('../models')
const { Reservation, Collection } = db
const { Op } = require('sequelize')  
const helpers = require('../helpers/auth-helpers')
const purposes = ['Auction', 'Research', 'Inquiry', 'Others']

const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Taipei')

const reservationController = {
  getReservations: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null

      const reservations = await Reservation.findAll({
        where: { UserId: userId },
        attributes: ['id', 'contact_person', 'phone', 'time', 'visitor_num', 'purpose', 'description', 'work_count'],
        include: { model: Collection, attributes: ['id', 'name'] },
        raw: true, nest: true
      })

      reservations.forEach(reserve => {
        let time = dayjs.tz(reserve.time)
        reserve.date = time.format('YYYY/MM/DD')
        reserve.timeSlot = time.format('HH:mm')
        reserve.description = reserve.description.length ? (reserve.description.slice(0, 20) + '...') : ""
      })

      return res.render('reservations', { reservations })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  createReservation: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null

      // find user's all collections
      const collections = helpers.getUser(req)?.Collections
      collections.forEach(col => {
        col.work_count = col.JoinedArtworks.length
        delete col.JoinedArtworks
      })

      // date limit within 1 month
      const tomorrow = dayjs.tz().add(1, 'day').format('YYYY-MM-DD')
      const nextMonth = dayjs.tz().add(1, 'month').format('YYYY-MM-DD')
      const date_limit = { min: tomorrow, max: nextMonth }

      // find available date & slot
      const reservedDates = await Reservation.findAll({
        where: { time: { [Op.between]: [date_limit.min, date_limit.max]}},
        attributes: ['time'],
        raw: true
      })

      reservedDates.forEach(date => {
        let time = date.time
        date.date = dayjs.tz(time).format('YYYY-MM-DD')
        date.time = dayjs.tz(time).format('HH:mm')
      })

      // return res.json({ 
      //    statue: 'success', collections, purposes, date_limit,
      //    reservedDates: JSON.stringify(reservedDates)
      // })
      return res.render('reservation', { 
        collections, purposes, date_limit, 
        reservedDates: JSON.stringify(reservedDates) // for <script> {{{reservedDates}}}
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}


module.exports = reservationController