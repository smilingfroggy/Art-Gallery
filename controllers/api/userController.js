const jwt = require('jsonwebtoken')

const userController = {
  login: async (req, res, next) => {
    try {
      let userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      return res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      console.log(err)
      next(err)
    }
  }
}

module.exports = userController