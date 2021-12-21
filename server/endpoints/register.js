const validate = require('../services/validationService')
const hashService = require('../services/hashService')
const databaseService = require('../services/databaseService')

module.exports = (app) => {
  app.post('/register', async (req, res) => {
    try {
      let valid = await validate(req.body)
      if (valid === true) {
        try {
          const hash = await hashService.hashNSalt(req.body.Password)
          console.log(hash)
          if (typeof hash === 'string' || hash instanceof String) {
            req.body.Password = hash
            databaseService.register(req)
              .then(() => {
                const token = tokenService.generateAccessToken(req.body.Username)
                res.send({result: true, token: token})
              })
              .catch((err) => {
                let error = 'an error has occured'
                switch (err.errors[0].type) {
                  case "unique violation":
                    error = `${err.errors[0].value} already exists, please use a different one`
                }
              })
          } else {
            throw new Error(hash)
          }
        } catch (err) {
          console.log(err)
          res.status(400).send("An error has occured registering")
        }
      } else {
        console.log(valid)
        res.send({error: valid})
      }
    } catch (err) {
      res.status(400).send(err)
    }
  })
}