const dateHelpers = require('../helpers/date-helpers')
const { Reservation, Artwork, User, Collection, Medium } = require('../models')
const { Op } = require('sequelize')

const adminReserveController = {
  getUpcomingReservations: async (req, res, next) => {
    try {
      // get all future reservations
      const reservations = await Reservation.findAll({
        attributes: ['id', 'contact_person', 'phone', 'visitor_num', 'time', 'purpose', 'work_count','description', 'status', 'sn'],
        include: [
          { model: User, attributes: ['name', 'email'] },
          { model: Collection, attributes: ['id', 'name'] }
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
  }
}


module.exports = adminReserveController