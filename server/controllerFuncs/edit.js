const error = require('../middleware/error')

const errMsg = 'The data received is invalid. This is probably a client side error.'

const required_att = [
  "definition",
  "pronounciation",
  "contexts",
  "examples",
  "links"
]

module.exports = {
  async validate (req, res, next) {
    try {
      let data = req.body.spoodawebData
      if (data === undefined) return next(error.create(errMsg))
      console.log(data)
      for (const budName in data) {
        const bud = data[budName]
        console.log(bud)
        switch (bud.type) {
          case undefined:
            return next(error.create(errMsg))
          case 'add':
            required_att.forEach(att => {
              if (bud.data[att] === undefined) return next(error.create(errMsg))
            })
            break
          case 'sub':
            if (bud.data.id === undefined) return next(error.create(errMsg))
            break
        }
        next()
      }
    } catch(err) {
      next(err)
    }
  },
  async end (req, res, next) {
    res.send({type: true, message: 'spoodaweb successfully saved'})
  },
  async errorHandler (error, req, res, next) {
    console.log(error)
    let message = 'An error has occured in the server, please try again later'
    if (error.message && error.type) message = error.message
    let response = {error: {message: message}}
    res.status(500).send(response)
  }
}
