const { Sequelize, Model, DataTypes } = require("sequelize")
const config = require('../config/config')
const tokenService = require('../services/tokenService')
const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)
const queryInterface = sequelize.getQueryInterface()

const User = require('../models/user')(sequelize, DataTypes)
const Article = require('../models/article')(sequelize, DataTypes)

// sequelize.sync({ force: true })
sequelize.sync(config.db.options)

module.exports = {
  async register (req) {
    console.log(req)
    await User.create({
      username: req.body.Username,
      email: req.body.Email,
      password: req.body.Password
    })
  },
  async findUser (Username) {
    const user = await User.findOne({
      where: {username: Username}
    })
    return user
  },
  async createArticle (req) {
    const tokenService = require('../services/tokenService')
    const token = req.header('authorization')
    const data = tokenService.authenticateToken(req)
    console.log(data)
    const article = await Article.create({
      title: req.body.title,
      description: req.body.description,
      text: req.body.text,
      userId: data.userId
    })
    return article
  }
}
