const { Sequelize, Model, DataTypes } = require("sequelize")
const config = require('../config/config')
const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)
const queryInterface = sequelize.getQueryInterface()

const User = require('../models/user')(sequelize, DataTypes)

sequelize.sync({ force: true })
sequelize.sync(config.db.options)

module.exports = {
  async register (req) {
    await User.create({
      username: req.body.Username,
      email: req.body.Email,
      password: req.body.Password
    })
  }
}
