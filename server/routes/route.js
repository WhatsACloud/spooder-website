const dbs = require('../services/databaseService')
const validate = require('../services/validationService')

module.exports = {
  register (app) {
    app.post('/register', async (req, res) => {
      try {
        if (await validate(req.body)) {
          await dbs.register(req)
          res.send("success")
        } else {
          res.send("Passwords must have a minimum of eight characters, at least one letter, one number and one special character")
        }
      } catch (err) {
        res.status(400).send(err.errors[0].message)
      }
    })
  }
}