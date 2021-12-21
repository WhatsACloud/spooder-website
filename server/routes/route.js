const required = [
  require('../endpoints/login'),
  require('../endpoints/register'),
  require('../endpoints/createArticle')
]

module.exports = (app) => {
  required.forEach((item) => {
    item(app)
  })
}