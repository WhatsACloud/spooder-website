const { Sequelize, Model, DataTypes } = require("sequelize")
const config = require('../config/config')
const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)

const queryInterface = sequelize.getQueryInterface()

// sequelize.sync({ force: true })
sequelize.sync(config.db.options)

module.exports = {sequelize: sequelize, DataTypes: DataTypes}