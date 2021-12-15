const { Sequelize, Model, DataTypes } = require("sequelize")
const config = require('../config/config')
console.log(config)
const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)
const queryInterface = sequelize.getQueryInterface()

const User = sequelize.define("User", userTable) // pls fix this

queryInterface.createTable('User', userTable)

//sequelize.sync({ force: true })

module.exports = {
  register (req) {
    User.create({
      username: req.body.Username,
      email: req.body.Email,
      password: req.body.Password
    }).catch(console.error)
  }
}
