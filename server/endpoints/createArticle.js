const databaseService = require('../services/databaseService')
const tokenService = require('../services/tokenService')

module.exports = (app) => {
  app.post('/articles/create', async (req, res) => {
    try {
      console.log(req.body, req.headers)
      const token = req.header('authorization')
      console.log(token)
      // let test = await databaseService.createArticle(req)
      // console.log(test)
      res.send('success')
    } catch (err) {
      console.log(err)
      res.status(400).send()
    }
  })
}