// stored for future reference

/*
const User = require('../database_models/user')(sequelize, DataTypes)
const Article = require('../database_models/article')(sequelize, DataTypes)

module.exports = {
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
*/