const dbs = require('./databaseService')

module.exports = async (app) => {
  app.post('/login', (req, res) => {
    dbs.register(req)
    res.send("penis")
  })
}