const login = require('../controllerFuncs/login')
const userModel = require('../models/user')
const jwtToken =  require('../middleware/jwtToken')
const error = require('../middleware/error')

const { Router } = require('express')

const router = Router()

router.post(
  '/',
  login.allFieldsFilled, 
  userModel.find, 
  login.databaseHandler, 
  login.comparePasswords, 
  jwtToken.generateAccessToken,
  login.end, 
  error.errorHandler
)

module.exports = router