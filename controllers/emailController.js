const emailService = require('../services/emailService')

const emailController = {
  testEmail: async (req, res, next) => {
    // Test email functions with checktls.com
    try {
      const { email, subject } = req.body
      console.log('Sending test mail to ', email)
      if (!email || !subject) throw new Error('Please provide complete messages')
      if (subject.length > 30) throw new Error('Subject is too long')

      const message_body = `TLS <br>TextResult <br>Headers`
      await emailService.sendEmail(email, subject, message_body)
      req.flash('success_messages', 'Email was sent successfully. Please check your email')
      return res.redirect('/')
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

module.exports = emailController