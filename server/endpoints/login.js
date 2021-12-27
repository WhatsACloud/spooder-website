const hashService = require('../services/hashService')
const databaseService = require('../services/databaseService')
const tokenService = require('../services/tokenService')

module.exports = (app) => {
  app.post('/login', async (req, res) => {
    if (!(req.body.Password && (req.body.Email || req.body.Username))) res.send({error: 'Please fill in all required fields'})
    let dbObject = null
    let dbPassword = null
    try {
      dbObject = await databaseService.findUser(req.body.Username)
      dbPassword = dbObject.dataValues.password
    } catch (err) {
      console.log(err)
      res.send({error: 'User does not exist'})
    }
    try {
      console.log(req.body.Password, dbPassword)
      const matches = await hashService.compare(req.body.Password, dbPassword)
      console.log(matches, req.body.Password, dbPassword)
      switch (matches) {
        case true:
          console.log(dbObject)
          const token = tokenService.generateAccessToken(dbObject.dataValues.id)
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