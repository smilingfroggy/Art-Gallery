const { Sequelize } = require('sequelize')
const db = require('../../models');
const Subject = db.Subject

const subjectController = {
  postSubject: async (req, res, next) => {
    try {
      const { name } = req.body
      if (!name) return res.json({message: 'No name provided'})
      if (name.length > 20) return res.json({ message: 'Subject name is too long'})
      
      const [subject, created] = await Subject.findOrCreate({
        where: { name }
      })

      if (created) {
        return res.json({ message: 'Created successfully', subject })
      }
      return res.json({ message: 'Subject already existed', subject })

    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

module.exports = subjectController