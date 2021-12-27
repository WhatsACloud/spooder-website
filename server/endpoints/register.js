const validate = require('../services/validationService')
const hashService = require('../services/hashService')
const databaseService = require('../services/databaseService')
const tokenService = require('../services/tokenService')

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
              .then(async () => {
                const user = await databaseService.findUser(req.body.Username)
                console.log(user)
                const token = tokenService.generateAccessToken(user.dataValues.id)
                res.send({result: true, token: token})
              })
              .catch((err) => {
                let error = 'an error has occured'
                switch (err.errors[0].type) {
                  case "unique violation":
                    error = `${err.errors[0].value} already exists, please use a different one`
                }
                res.status(500).send(error)
              })
          } else {
            throw new Error(hash)
          }
        } catch (err) {
          console.log(err)
          res.status(500).send("An error has occured registering")
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