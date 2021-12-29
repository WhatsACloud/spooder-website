const { sequelize, DataTypes } = require('../../database')
const User = require('../../database_models/user')(sequelize, DataTypes)

module.exports = {
  create: async (req, res, next) => {
    const { Username, Email, Password } = req.body
    try {
      const user = await User.create({
        username: Username,
        email: Email,
        password: Password
      })
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
  }
}