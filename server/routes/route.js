const dbs = require('../services/databaseService')
const validate = require('../services/validationService')
const hashService = require('../services/hashService')

module.exports = {
  register (app) {
    app.post('/register', async (req, res) => {
      try {
        let valid = await validate(req.body)
        if (valid === true) {
          try {
            const hash = await hashService.hashNSalt(req.body.Password)
            console.log(hash)
            if (typeof hash === 'string' || hash instanceof String) {
              req.body.Password = hash
              dbs.register(req)
                .then(() => {
                  res.send(true)
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
          res.status(400).send(valid)
        }
      } catch (err) {
        res.status(400).send(err)
      }
    })
  }
}