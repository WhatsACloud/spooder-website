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
const Article = require('../models/article')(sequelize, DataTypes)

//sequelize.sync({ force: true })
sequelize.sync(config.db.options)

module.exports = {
  async register (req) {
    await User.create({
      username: req.body.Username,
      email: req.body.Email,
      password: req.body.Password
    })
  },
  async login (req) {
    const user = await User.findOne({
      where: {username: req.body.Username}
    })
    return user
  },
  async createArticle (req) {
    const article = await Article.create({
      title: req.body.title,
      description: req.body.description,
      text: req.body.text
    })
    return article
  }
}
