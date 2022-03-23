const { sequelize, DataTypes } = require('../database')
const bcrypt = require('bcrypt')
const User = require('../databaseModels/user')(sequelize, DataTypes)
const error = require('../middleware/error')
const Joi = require('joi')

const password_schema = Joi.object({
  Email: Joi.string()
    .required()
    .messages({
      'any.required': `email|Email is a required field`,
      'string.empty': `email|Email is a required field`
    }),
  Password: Joi.string()
    .required()
    .messages({
      'any.required': `password|Password is a required field`,
      'string.empty': `password|Password is a required field`
    })
})

module.exports = {
  validateLogin: async (req, res, next) => {
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
  },
  async databaseHandler (req, res, next) {
    console.log(!(req.body.error))
    if (!(req.body.error)) {
      const user = req.body.dbUser
      req.body.dbPassword = user.dataValues.password
      req.body.id = user.dataValues.id
      req.body.username = user.dataValues.username
      next()
      return
    }
    next(error.create('User does not exist', {statusNo: 400}))
  },
  async comparePasswords (req, res, next) {
    // console.log(req.body)
    try {
      let password = req.body.Password
      let hash = req.body.dbPassword
      if (!(typeof password === 'string') || !(typeof hash === 'string')) {
        next(error.create('An error occured verifying the password'))
      }
      const comparison = await bcrypt.compare(password, hash)
      if (!comparison) {
        next(error.create('Password is incorrect'))
      }
      next()
    } catch (err) {
      next(err)
    }
  },
  end (req, res, next) {
    res.send({data: {token: req.body.token, username: req.body.Username}, type: true})
  }
}