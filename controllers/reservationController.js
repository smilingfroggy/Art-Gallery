const db = require('../models')
const { Reservation, Collection } = db
const { Op } = require('sequelize')
const sequelize = require('sequelize')
const helpers = require('../helpers/auth-helpers')
const purposes = ['拍賣', '學術研究', '洽購', '其他']
const reservationService = require('../services/reservationService')
const dateHelpers = require('../helpers/date-helpers')

const reservationController = {
  getReservations: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null
      if (helpers.getUser(req)?.isAdmin) return res.redirect('/admin/reservations')

      let reservations = await Reservation.findAll({
        where: { UserId: userId },
        attributes: ['id', 'contact_person', 'phone', 'time', 'visitor_num', 'purpose', 'description', 'status'],
        include: { 
          model: Collection, 
          attributes: ['id', 'name', 
            // count artworks in each collection
            [sequelize.literal(`(SELECT COUNT(*) FROM collectionArtworks AS ca WHERE ca.CollectionId = collection.id)`), 'work_count']
          ]
        },
        nest: true
      })
      
      reservations = JSON.parse(JSON.stringify(reservations))
      reservations.forEach(reserve => {
        reserve.date = dateHelpers.getDateString(reserve.time) // YYYY-MM-DD
        reserve.timeSlot = dateHelpers.getTimeString(reserve.time) // HH:mm
        reserve.description = reserve.description.length ? (reserve.description.slice(0, 20) + '...') : ""
        if (!reserve.status) {
          if (reserve.time < Date.now()) reserve.status = '逾期未付款'
          else reserve.status = '待付款'
        } else {
          reserve.status = '預約完成'
        }
      })

      return res.render('reservations', { reservations })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getReservation: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null
      const { reservationId } = req.params
      if (!reservationId) throw new Error('Invalid reservationId')
      if (helpers.getUser(req)?.isAdmin) return res.redirect(`/admin/reservations/${reservationId}`)

      const reservation = await reservationService.getReservation(userId, reservationId)
      if (!reservation) throw new Error('Reservation not exist')
      if (reservation.UserId !== userId) throw new Error('Permission Denied')

      // show checked option of collection
      const collections = [{
        name: reservation.Collection.name,
        work_count: reservation.work_count
      }]

      return res.render('reservation', { 
        reservation, reservedDates: [], purposes, collections, readOnly: true
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  createReservation: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null
      const { reservationId } = req.params    // if it's going to edit reservation
      if (reservationId && !Number(reservationId)) throw new Error('Invalid reservationId')
      if (helpers.getUser(req)?.isAdmin) return res.redirect('/admin/reservations')
      if (reservationId && !userId) throw new Error('Permission Denied')

      // find user's all collections
      const collections = helpers.getUser(req)?.Collections
      collections.forEach(col => {
        col.work_count = col.JoinedArtworks.length
        delete col.JoinedArtworks
      })

      // date limit within 1 month
      const date_limit = dateHelpers.getDateLimit()
      
      // find available date & slot
      let reservedDates = await reservationService.getMonthReservations()
      reservedDates.forEach(reserve => {
        reserve.date = dateHelpers.getDateString(reserve.time) // YYYY-MM-DD
        reserve.time = dateHelpers.getTimeString(reserve.time) // HH:mm
      })
      
      if (reservationId) {    // edit reservation
        reservedDates = reservedDates.filter(reserve => reserve.id !== Number(reservationId))   // exclude itself
        
        // get reservation info
        const currentReservation = await reservationService.getReservation(userId, reservationId)
        if (!currentReservation) throw new Error('Reservation not exist')
        if (currentReservation.UserId !== userId) throw new Error('Permission Denied')

        return res.render('reservation', {
          collections, purposes, date_limit,
          reservedDates: JSON.stringify(reservedDates), // for <script> {{{reservedDates}}}
          reservation: currentReservation
        })
      }

      return res.render('reservation', { 
        collections, purposes, date_limit, 
        reservedDates: JSON.stringify(reservedDates), // for <script> {{{reservedDates}}}
        RECAPTCHA_SITEKEY: process.env.RECAPTCHA_SITEKEY
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  postReservation: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id || null
      if (helpers.getUser(req)?.isAdmin) return res.redirect('/admin/reservations')

      const { contact_person, phone, collection_select_count, visitor_num, date, date_time, purpose, description } = req.body

      if (!contact_person || !phone || !collection_select_count || !visitor_num || !date || !date_time || !purpose) throw new Error('Incomplete input')

      if (contact_person.length > 20 || phone.length > 10 || visitor_num > 8) throw new Error('Invalid input')
      
      const collectionId = collection_select_count.split(',')[0]
      const time = dateHelpers.getDateObj(`${date} ${date_time}`) // '2023-07-07 13:30' -> 2023-07-16T16:30:00+08:00Z

      // check date is within 1 month or duplicated
      if (!dateHelpers.checkWithinMonth(time)) throw new Error('Invalid date selected')
      const reservations = await reservationService.getMonthReservations()
      if (reservations.some(res => res.time.valueOf() === time.valueOf())) throw new Error('Selected time has been reserved')

      // check collection validity
      const collections = helpers.getUser(req)?.Collections
      if (!collections.some(col => col.id === Number(collectionId))) throw new Error('Invalid collection')

      const newReservation = await Reservation.create({
        UserId: userId,
        CollectionId: Number(collectionId),
        visitor_num: Number(visitor_num),
        contact_person, phone, purpose, description, time
      })
      if (newReservation) {
        req.flash('success_messages', `Received reservation on ${date} ${date_time} `)
      }
      res.redirect(`./reservations/${newReservation.id}`)
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
      if (!reservationId || !Number(reservationId)) throw new Error('Invalid reservation')
      if (helpers.getUser(req)?.isAdmin) return res.redirect(`/admin/reservations/${reservationId}`)

      const reservation = await Reservation.findByPk(reservationId)
      if (!reservation) throw new Error('Reservation does not exist')
      if (reservation.UserId !== userId) throw new Error('Permission Denied')
      if (!visitor_num || !date || !date_time) throw new Error('Incomplete input')

      // check date is within 1 month, later than 1 week, or not duplicated
      const time = dateHelpers.getDateObj(`${date} ${date_time}`)
      if (!dateHelpers.checkWithinMonth(time)) throw new Error('Invalid date selected')
      if (dateHelpers.checkWithinWeek(reservation.time)) throw new Error('Modification is not allowed')
      const date_limit = dateHelpers.getDateLimit()
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
      if (!reservationId || !Number(reservationId)) throw new Error('Invalid reservation')
      if (helpers.getUser(req)?.isAdmin) return res.redirect('/admin/reservations')
      
      const reservation = await Reservation.findByPk(reservationId)
      if (!reservation) throw new Error('Reservation does not exist')
      if (reservation.UserId !== userId) throw new Error('Permission Denied')

      // only delete reserves 1 week later
      if (dateHelpers.checkWithinWeek(reservation.time)) throw new Error('Cancellation is forbidden')
      const time = dateHelpers.getDateTimeString(reservation.time)  // YYYY-MM-DD HH:mm

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