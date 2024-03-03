const crypto = require('node:crypto')
const helpers = require('../helpers/auth-helpers')
const { Reservation } = require('../models')
const dateHelpers = require('../helpers/date-helpers')

const MerchantID = process.env.MERCHANT_ID
const HashKey = process.env.HASH_KEY
const HashIV = process.env.HASH_IV
const URL = process.env.URL
const NotifyURL = URL + '/newebpay/callback?from=NotifyURL'
const ReturnURL = URL + '/newebpay/callback?from=ReturnURL'

const paymentController = {
  getPayment: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req)?.id
      const userEmail = helpers.getUser(req)?.email
      const { reservationId } = req.params

      let reservation = await Reservation.findByPk(reservationId, {
        attributes: ['id', 'UserId', 'time', 'visitor_num', 'purpose', 'contact_person', 'phone', 'status']
      })
      if (!reservation) throw new Error('Reservation not exist')
      if (reservation.UserId !== userId) throw new Error('Permission Denied')
      if (reservation.status) throw new Error('Paid already!')
      if (reservation.time < Date.now()) throw new Error('Reservation is overdue')

      const MerchantOrderNo = `ID${reservationId}_${Date.now()}`
      await reservation.update({ sn: MerchantOrderNo })
      reservation = reservation.toJSON()
      reservation.time = dateHelpers.getDateTimeString(reservation.time)

      // tradeInfo
      let tradeData = {
        MerchantID,
        TimeStamp: Date.now(),
        Version: '2.0',
        RespondType: 'JSON',
        MerchantOrderNo,  // sn
        Amt: 200,
        NotifyURL,
        ReturnURL,
        Email: userEmail,
        ItemDesc: 'Reservation',
        OrderComment: '請注意：此為測試平台，請使用測試信用卡卡號：4000-2211-1111-1111'
      }
      let tradeStr = getTradeInfo(tradeData)
      let aesTradeInfo = aesEncrypt(tradeStr)
      let shaTradeInfo = shaEncrypt(aesTradeInfo)
      const payment = {
        TradeInfo: aesTradeInfo,
        TradeSha: shaTradeInfo,
        tradeData
      }

      return res.render('payment', { reservation, payment })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  postPaymentResult: async (req, res, next) => {
    try {
      const type = req.query.from
      const { Status, MerchantID: MerchantID_req, TradeInfo, TradeSha } = req.body
      if (!Status || !TradeInfo || !TradeSha || MerchantID != MerchantID_req) throw new Error('資料不正確')
      if (Status !== 'SUCCESS') throw new Error('交易失敗，請重新付款')
      if (type === 'ReturnURL') {
        req.flash('success_messages', `付款完成，已為您保留時段`)
        return res.redirect('/reservations')
      }
      // decrypt
      const decipher = crypto.createDecipheriv('aes-256-cbc', HashKey, HashIV)
      let decryptTradeInfo = decipher.update(TradeInfo, 'hex', 'utf8')
      decipher.setAutoPadding(false)
      decryptTradeInfo += decipher.final('utf8')
      // remove ASCII 0-31 & parse
      decryptTradeInfo = decryptTradeInfo.replace(/[\x00-\x1F\x7F]/g, "")
      decryptTradeInfo = JSON.parse(decryptTradeInfo)

      // update DB reservation status
      const { MerchantOrderNo } = decryptTradeInfo.Result
      const reservationId = Number(MerchantOrderNo.split('_')[0].slice(2,))
      const reservation = await Reservation.findOne({ where: {
        id: reservationId,
        sn: MerchantOrderNo
      }})
      await reservation.update({ status: true })
      return res.end()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

function getTradeInfo(dataObj) {
  let result = Object.entries(dataObj).map(([key, val]) => {
    return `${key}=${val}`
  })
  return result.join('&')
}

function aesEncrypt(dataStr) {
  const cipher = crypto.createCipheriv('aes-256-cbc', HashKey, HashIV)
  let encryptedData = cipher.update(dataStr, 'utf-8', 'hex')
  encryptedData += cipher.final('hex')
  return encryptedData
}

function shaEncrypt(dataAes) {
  dataAes = `HashKey=${HashKey}&${dataAes}&HashIV=${HashIV}`
  const hash = crypto.createHash('sha256')
  hash.update(dataAes)
  let dataSha = hash.digest('hex').toUpperCase()
  return dataSha
}

module.exports = paymentController