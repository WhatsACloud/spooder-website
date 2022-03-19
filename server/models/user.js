const { sequelize, DataTypes } = require('../database')
const User = require('../databaseModels/user')(sequelize, DataTypes)
const error = require('../middleware/error')

module.exports = {
  create: async (req, res, next) => {
    const { Username, Email, Password } = req.body
    try {
      const user = await User.create({
        username: Username,
        email: Email,
        password: Password
      })
      req.body.id = user.dataValues.id
      next()
    } catch (err) {
      const newError = error.create()
      newError.type = 'database'
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          newError.message = 'The email or username entered in already exists within the database, please enter in a different username or email.'
          break
        default:
          newError.message = 'An error has occured within the database, please try again later.'
          break
      }
      next(newError)
    }
  },
  async find (req, res, next) {
    try {
      const user = await User.findOne({
        where: {username: req.body.Username}
      })
      if (!user) {
        req.body.error = true
        next()
      }
      req.body.dbUser = user
      next()
    } catch (err) {
      next(err)
    }
  }
}