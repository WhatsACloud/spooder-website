const Joi = require('joi')
const error = require('../middleware/error')

const password_schema = Joi.object({
  Username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': `username|Username should only contain letters and numbers'`,
      'string.min': `username|Username should have a minimum of 3 characters`,
      'string.max': `username|Username should have a maximum of 3 characters`,
      'any.required': `username|Username is a required field`,
      'string.empty': `username|Username is a required field`
    }),
  Email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': `email|Email is invalid`,
      'any.required': `email|Email is a required field`,
      'string.empty': `email|Email is a required field`
    }),
  Password: Joi.string()
    .min(8)
    .max(40)
    .required()
    .messages({
      'string.min': 'password|Password should have at least 8 characters',
      'string.max': 'password|Password should have at most 40 characters',
      'any.required': `password|Password is a required field`,
      'string.empty': `password|Password is a required field`
    })
})

module.exports = {
  end (req, res, next) {
    res.send({token: req.body.token, username: req.body.Username, type: true})
  },
  validatePassword: async (req, res, next) => {
    let user = req.body
    try {
      const value = await password_schema.validateAsync(req.body)
      next()
    } catch (err) {
      const data = err.details[0]
      if (err.details) {
        if (data.message.includes('"')) {
          data.message = "An error has occured registering"
        } else {
          const errData = data.message.split("|")
          console.log(errData)
          data.type = errData[0]
          data.message = errData[1]
        }
        const newError = error.create(data.message, {type: data.type})
        next(newError)
      } else {
        next(error.create())
      }
    }
  }
}