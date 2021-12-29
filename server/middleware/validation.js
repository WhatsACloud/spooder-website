const { string } = require('joi')
const Joi = require('joi')

const password_schema = Joi.object({
  Username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': `Username should only contain letters and numbers'`,
      'string.min': `Username should have a minimum of 3 characters`,
      'string.max': `Username should have a maximum of 3 characters`,
      'any.required': `Username is a required field`,
      'string.empty': `Username is a required field`
    }),
  Email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': `Email is invalid`,
      'any.required': `Email is a required field`,
      'string.empty': `Email is a required field`
    }),
  Password: Joi.string()
    .pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'))
    .required()
    .messages({
      'string.pattern.base': `A password should be at least 8 characters long and contain the following: 1 uppercase letter, 1 lowercase letter, 1 number ranging from 0-9, and a special character`,
      'any.required': `Password is a required field`,
      'string.empty': `Password is a required field`
    }),
  RepeatPassword: Joi.string()
    .required()
    .valid(Joi.ref('Password'))
    .messages({
      'any.only': `Please confirm password again`,
      'any.required': `Confirm password is a required field`
    })
})

module.exports = {
  validatePassword: async (req, res, next) => {
    let user = req.body
    try {
      const value = await password_schema.validateAsync(req.body)
      next()
    } catch (err) {
      if (err.name === 'ValidationError') {
        if (err.details[0].message.includes('"')) {
          err.details[0].message = "An error has occured registering"
        } else {
          err.type = 'validation'
        }
      }
      next(err)
    }
  }
}