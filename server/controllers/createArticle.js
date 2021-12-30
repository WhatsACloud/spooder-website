const article = require('../models/article')
const jwtToken = require('../middleware/jwtToken')

module.exports = (app) => {
  app.post('/articles/create', article.validate, jwtToken.authenticateToken, article.create, article.end, article.errorHandler)
}