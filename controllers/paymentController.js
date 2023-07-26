const crypto = require('node:crypto')
const helpers = require('../helpers/auth-helpers')
const reservationService = require('../services/reservationService')

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

      const reservation = await reservationService.getReservation(userId, reservationId)
      if (!reservation) throw new Error('Reservation not exist')
      if (reservation.UserId !== userId) throw new Error('Permission Denied')

      // tradeInfo
      let tradeData = {
        MerchantID,
        TimeStamp: Date.now(),
        Version: '2.0',
        RespondType: 'JSON',
        MerchantOrderNo: `ID${reservationId}_${Date.now()}`,
        Amt: 200,
        NotifyURL,
        ReturnURL,
        Email: userEmail,
        ItemDesc: 'Reservation'
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