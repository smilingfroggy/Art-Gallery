const db = require('../models')
const { Reservation, Collection } = db
const { Op } = require('sequelize')  
const helpers = require('../helpers/auth-helpers')
const purposes = ['拍賣', '學術研究', '洽購', '其他']

const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isBetween)
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
      const { reservationId } = req.params    // edit reservation

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

      if (reservationId) {    // edit reservation
        // get reservation info
        const currentReservation = await Reservation.findByPk(reservationId, {
          where: { UserId: userId },
          attributes: ['id', 'UserId', 'contact_person', 'phone', 'time', 'visitor_num', 'purpose', 'description', 'work_count'],
          include: { model: Collection, attributes: ['id', 'name'] },
          raw: true, nest: true
        })
        if (!currentReservation) throw new Error('Reservation not exist')
        if (currentReservation.UserId !== userId) throw new Error('Permission Denied')

        currentReservation.date = dayjs.tz(currentReservation.time).format('YYYY-MM-DD')  // '2023-07-28'
        currentReservation.time = dayjs.tz(currentReservation.time).format('HH:mm')       // '16:30'
        
        return res.render('reservation', {
          collections, purposes, date_limit,
          reservedDates: JSON.stringify(reservedDates), // for <script> {{{reservedDates}}}
          reservation: currentReservation
        })
      }

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
  },
  postReservation: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null

      const { contact_person, phone, collection_select_count, visitor_num, date, date_time, purpose, description } = req.body

      if (!contact_person || !phone || !collection_select_count || !visitor_num || !date || !date_time || !purpose) throw new Error('Incomplete input')

      if (contact_person.length > 20 || phone.length > 10 || visitor_num > 8) throw new Error('Invalid input')
      
      const collectionId = collection_select_count.split(',')[0]
      const work_count = collection_select_count.split(',')[1]
      const time = dayjs.tz(`${date} ${date_time}`)  // '2023-07-07 13:30' -> 2023-07-16T16:30:00+08:00Z
      
      // check date is within 1 month
      const tomorrow = dayjs.tz().add(1, 'day') // .format('YYYY-MM-DD')
      const nextMonth = dayjs.tz().add(1, 'month') //.format('YYYY-MM-DD')
      if (!time.isBetween(tomorrow, nextMonth)) throw new Error('Invalid date selected')

      // check if date duplicates
      const date_limit = { min: tomorrow.format('YYYY-MM-DD'), max: nextMonth.format('YYYY-MM-DD') }
      const reservations = await Reservation.findAll({
        where: { time: { [Op.between]: [date_limit.min, date_limit.max] }},
        attributes: ['id', 'time'],
        raw: true
      })
      if (reservations.some(res => res.time.valueOf() === time.valueOf())) throw new Error('Selected time has been reserved')

      // check collection validity
      const collections = helpers.getUser(req)?.Collections
      if (!collections.some(col => col.id === Number(collectionId))) throw new Error('Invalid collection')

      const newReservation = await Reservation.create({
        UserId: userId,
        CollectionId: Number(collectionId),
        visitor_num: Number(visitor_num),
        work_count: Number(work_count), 
        contact_person, phone, purpose, description, time
      })
      if (newReservation) {
        req.flash('success_messages', `Received reservation on ${date} ${date_time} `)
      }
      res.redirect('./reservations')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  editReservation: async(req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null
      const { reservationId } = req.params
      const { visitor_num, date, date_time, description } = req.body

      const reservation = await Reservation.findByPk(reservationId)
      if (!reservation) throw new Error('Reservation does not exist')
      if (reservation.UserId !== userId) throw new Error('Permission Denied')
      if (!visitor_num || !date || !date_time) throw new Error('Incomplete input')

      // check date is within 1 month
      const time = dayjs.tz(`${date} ${date_time}`)  // '2023-07-07 13:30' -> 2023-07-16T16:30:00+08:00Z
      const tomorrow = dayjs.tz().add(1, 'day')
      const nextMonth = dayjs.tz().add(1, 'month')
      if (!time.isBetween(tomorrow, nextMonth)) throw new Error('Invalid date selected')

      // check if date duplicates
      const date_limit = { min: tomorrow.format('YYYY-MM-DD'), max: nextMonth.format('YYYY-MM-DD') }
      const reservations = await Reservation.findAll({
        where: { 
          time: {[Op.between]: [date_limit.min, date_limit.max]},
          id: {[Op.ne]: reservationId }
        },
        attributes: ['id', 'time'],
        raw: true
      })
      if (reservations.some(res => res.time.valueOf() === time.valueOf())) throw new Error('Selected time has been reserved')

      // update reservation
      await reservation.update({
        visitor_num: Number(visitor_num),
        description, time
      })

      req.flash('success_messages', `Updated reservation on ${date} ${date_time} `)

      return res.redirect('/reservations')
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  deleteReservation: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null
      const { reservationId } = req.params
      
      const reservation = await Reservation.findByPk(reservationId)
      if (!reservation) throw new Error('Reservation does not exist')
      if (reservation.UserId !== userId) throw new Error('Permission Denied')

      // only delete reserves 1 week later
      if (reservation.time < dayjs().add(1,'week')) throw new Error('Cancellation is forbidden')
      const time = dayjs.tz(reservation.time).format('YYYY-MM-DD HH:mm')

      await reservation.destroy()
      req.flash('success_messages', `Cancelled reservation on ${time}`)
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      next(error)
    }
  }  
}

module.exports = reservationController