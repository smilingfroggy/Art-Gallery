const nodemailer = require('nodemailer')

async function sendEmail (to, subject, html) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  })
  await transporter.verify()

  return transporter.sendMail({
    from: `"Art-Gallery" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html
  })
}


module.exports = { sendEmail }