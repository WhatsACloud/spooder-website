const { sequelize, DataTypes } = require('../database')
const errorCreator = require('../helperFunctions/errorCreator')
const User = require('../database_models/user')(sequelize, DataTypes)
const Article = require('../database_models/article')(sequelize, DataTypes)

const lookupList = [
  'title',
  'description',
  'text'
]

module.exports = {
  validate (req, res, next) {
    try {
      lookupList.forEach((key, index) => {
        if (!req.body[key]) req.body[key] = ''
      })
      next()
    } catch (err) {
      next(err)
    }
  },
  async create (req, res, next) {
    const userId = req.body.jwtTokenData.userId
    try {
      const article = await Article.create({
        fk_user_id: userId,
        title: req.body.title,
        description: req.body.description,
        text: req.body.text
      })
      // console.log(article)
      req.body.articleId = article.dataValues.id
      next()
    } catch (err) {
      next(err)
    }
  },
  end (req, res, next) {
    res.send({data: {articleId: req.body.articleId, result: true, message: 'Article successfully created'}})
  },
  errorHandler (error, req, res, next) {
    console.log(error)
    let message = 'An error occured on the server'
    if (error.type) message = error.message
    res.status(500).send({error: {message: message}})
  }
}