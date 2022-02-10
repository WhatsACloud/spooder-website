const required = [
  require('../controllers/login'),
  require('../controllers/register'),
  require('../controllers/createArticle')
]

module.exports = (app) => {
  required.forEach((item) => {
    item(app)
  })
}