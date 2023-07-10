const dayjs = require('dayjs')
const db = require('../models')
const { Reservation } = db
const { Op } = require('sequelize')  
const helpers = require('../helpers/auth-helpers')
const purposes = ['Auction', 'Research', 'Inquiry', 'Others']

const reservationController = {
  createReservation: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null
      if (!userId) return res.redirect('back')

      // find user's all collections
      const collections = helpers.getUser(req)?.Collections
      collections.forEach(col => {
        col.work_count = col.JoinedArtworks.length
        delete col.JoinedArtworks
      })

      // date limit within 1 month
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
      const nextMonth = dayjs().add(1, 'month').format('YYYY-MM-DD')
      const date_limit = { min: tomorrow, max: nextMonth }

      // find available date & slot
      const reservedDates = await Reservation.findAll({
        where: { time: { [Op.between]: [date_limit.min, date_limit.max]}},
        attributes: ['time'],
        raw: true
      })

      reservedDates.forEach(date => {
        let time = date.time
        date.date = dayjs(time).format('YYYY-MM-DD')
        date.time = dayjs(time).format('HH:mm')
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