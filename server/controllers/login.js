const login = require('../controllerFuncs/login')
const userModel = require('../models/user')
const jwtToken =  require('../middleware/jwtToken')

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
  login.errorHandler
)

module.exports = router