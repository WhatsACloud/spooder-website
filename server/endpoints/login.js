const hashService = require('../services/hashService')
const databaseService = require('../services/databaseService')
const tokenService = require('../services/tokenService')

module.exports = (app) => {
  app.post('/login', async (req, res) => {
    if (!(req.body.Password && (req.body.Email || req.body.Username))) res.send({error: 'Please fill in all required fields'})
    let dbPassword = null
    try {
      const dbObject = await databaseService.login(req)
      dbPassword = dbObject.dataValues.password
    } catch (err) {
      console.log(err)
      res.send({error: 'User does not exist'})
    }
    try {
      const matches = await hashService.compare(req.body.Password, dbPassword)
      switch (matches) {
        case true:
          const token = tokenService.generateAccessToken(req.body.Username)
          console.log("token", token)
          res.send({result: {token: token, username: req.body.Username}})
          break
        case false:
          res.send({error: 'Password is incorrect'})
          break
        default:
          throw new Error
      }
    } catch (err) {
      console.log(err)
      res.status(400).send()
    }
  })
}