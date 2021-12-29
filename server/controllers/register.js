const register = require('../models/register')
const validate = require('../middleware/validation')
const hash = require('../middleware/hash')
const user = require('../middleware/databaseModelCreator').user
const token = require('../middleware/jwtToken')

module.exports = (app) => {
  app.post('/register', validate.validatePassword, hash.hashNSalt, user.create, token.generateAccessToken, register.end, register.errorHandler)
}