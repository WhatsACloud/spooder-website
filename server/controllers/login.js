const login = require('../models/login')
const userDatabase = require('../middleware/databaseModelCreator').user
const jwtToken =  require('../middleware/jwtToken')

const { Router } = require('express')

const router = Router()

router.post(
  '/create',
  login.allFieldsFilled, 
  userDatabase.find, 
  login.databaseHandler, 
  login.comparePasswords, 
  jwtToken.generateAccessToken, 
  login.end, 
  login.errorHandler
)

module.exports = router