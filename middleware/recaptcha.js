const axios = require('axios')
const secret = process.env.RECAPTCHA_SECRET
const reCAPTCHA_Verify_URL = 'https://www.google.com/recaptcha/api/siteverify'

async function verifyCaptcha(req, res, next) {
  const reCAPTCHA_response = req.body['g-recaptcha-response']

  try {
    const response = await axios.post(`${reCAPTCHA_Verify_URL}?secret=${secret}&response=${reCAPTCHA_response}`)
    if (!response.data.success) {
      console.log('reCAPTCHA verification failed', response.data['error-codes'])
      throw new Error('reCAPTCHA verification failed')
    }
    next()
  } catch (error) {
    console.log(error)
    next(error)
  }
}

module.exports = verifyCaptcha;