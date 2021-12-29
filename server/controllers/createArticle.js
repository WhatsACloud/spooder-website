// const databaseService = require('../services/databaseService')

module.exports = (app) => {
  app.post('/articles/create', async (req, res) => {
    try {
      // let test = await databaseService.createArticle(req)
      console.log(test)
      res.send('success')
    } catch (err) {
      console.log(err)
      res.status(400).send()
    }
  })
}