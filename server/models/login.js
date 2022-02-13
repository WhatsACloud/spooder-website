const { sequelize, DataTypes } = require('../database')
const bcrypt = require('bcrypt')
const User = require('../databaseModels/user')(sequelize, DataTypes)
const errorCreate = require('../middleware/errorCreator')

module.exports = {
  allFieldsFilled (req, res, next) {
    if (!(req.body.Password && (req.body.Email || req.body.Username))) {
      next( errorCreate( 'Please fill in all required fields', { type: true } ) )
    }
    next()
  },
  async databaseHandler (req, res, next) {
    console.log(!(req.body.error))
    if (!(req.body.error)) {
      const user = req.body.dbUser
      req.body.dbPassword = user.dataValues.password
      req.body.id = user.dataValues.id
      next()
      return
    }
    next( errorCreate( 'User does not exist', { type: true } ) )
  },
  async comparePasswords (req, res, next) {
    // console.log(req.body)
    try {
      let password = req.body.Password
      let hash = req.body.dbPassword
      if (!(typeof password === 'string') || !(typeof hash === 'string')) {
        next( errorCreate( 'An error occured verifying the password', { type: true } ) )
      }
      const comparison = await bcrypt.compare(password, hash)
      if (!comparison) {
        next( errorCreate( 'Password is incorrect', { type: true } ) )
      }
      next()
    } catch (err) {
      next(err)
    }
  },
  end (req, res, next) {
    res.send({data: {token: req.body.token, username: req.body.Username}})
  },
  errorHandler (error, req, res, next) {
    console.log(error)
    let message = 'An error has occured in the server, please try again later'
    if (error.type) message = error.message
    let response = {error: {message: message}}
    try {
      if (error.message && error.type) response.error.message = error.message
    } catch (err) {} // just in case
    res.status(500).send(response)
  }
}