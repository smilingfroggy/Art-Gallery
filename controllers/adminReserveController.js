const dateHelpers = require('../helpers/date-helpers')
const { Reservation, Artwork, User, Collection, Medium } = require('../models')
const { Op } = require('sequelize')
const sequelize = require('sequelize')

const adminReserveController = {
  getUpcomingReservations: async (req, res, next) => {
    try {
      // get all future reservations
      const reservations = await Reservation.findAll({
        attributes: ['id', 'contact_person', 'phone', 'visitor_num', 'time', 'purpose', 'description', 'status', 'sn'],
        include: [
          { model: User, attributes: ['name', 'email'] },
          { model: Collection, attributes: ['id', 'name', 
            [sequelize.literal(`(SELECT COUNT(*) FROM collectionArtworks AS ca WHERE ca.CollectionId = collection.id)`), 'work_count']
          ]}
        ],
        where: { time: { [Op.gt]: Date.now() } },
        order: [['time', 'ASC']],
        raw: true,
        nest: true
      })
      reservations.forEach(reservation => {
        reservation.date = dateHelpers.getDateString(reservation.time) // YYYY-MM-DD
        reservation.timeSlot = dateHelpers.getTimeString(reservation.time) // HH:mm
        if (!reservation.status) {
          if (reservation.time < Date.now()) reservation.status = '逾期未付款'
          else reservation.status = '待付款'
        } else {
          reservation.status = '預約完成'
        }

      })

      return res.render('admin/reservations', {reservations})
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  getReservation: async (req, res, next) => {
    try {
      const { reservationId } = req.params
      if (!reservationId) throw new Error('ReservationId not exist')

      // get reservation and associated collection, artworks, and user
      let reservation = await Reservation.findByPk(reservationId, {
        attributes: ['id', 'contact_person', 'phone', 'visitor_num', 'time', 'purpose', 'description', 'status', 'sn'],
        include: [{ model: User, attributes: ['name', 'email'] },
        {
          model: Collection, attributes: ['id', 'name'], include:
          {
            model: Artwork,
            as: 'JoinedArtworks',
            attributes: ['id', 'name', 'artistName', 'serialNumber', 'creationTime', 'height', 'width', 'depth', 'piecesNum'],
            through: { attributes: [] },
            include: { model: Medium, attributes: ['name'] }
          }
        }
        ]
      })
      if (!reservation) throw new Error('Reservation not exist')
      reservation = reservation.toJSON()

      // organize reservation's date, time, status; artworks' creationTime, size
      reservation.date = dateHelpers.getDateString(reservation.time) // YYYY-MM-DD
      reservation.timeSlot = dateHelpers.getTimeString(reservation.time) // HH:mm
      if (!reservation.status) {
        if (reservation.time < Date.now()) reservation.status = '逾期未付款'
        else reservation.status = '待付款'
      } else {
        reservation.status = '預約完成'
      }
      reservation.work_count = reservation.Collection.JoinedArtworks.length

      reservation.Collection.JoinedArtworks.forEach(work => {
        work.creationTime = work.creationTime ? new Date(work.creationTime).getFullYear() : ""
        work.size = work.depth === "0" ? (work.height + "x" + work.width + "x" + work.depth) : (work.height + "x" + work.width)
      })

      return res.render('admin/reservation', { reservation })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
}


module.exports = adminReserveController