const { sequelize, DataTypes } = require('../database')
const User = require('../databaseModels/user')(sequelize, DataTypes)

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
      err.type = 'database'
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          err.errors[0].message = 'Email or username already exists'
          break
        default:
          err.errors[0].message = 'An error has occured within the database'
          break
      }
      next(err)
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