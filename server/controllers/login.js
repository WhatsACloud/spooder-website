const login = require('../models/login')
const userDatabase = require('../middleware/databaseModelCreator/user')
const jwtToken =  require('../middleware/jwtToken')

module.exports = (app) => {
  app.post('/login', login.allFieldsFilled, userDatabase.find, login.databaseHandler, login.comparePasswords, jwtToken.generateAccessToken, login.end, login.errorHandler)
}