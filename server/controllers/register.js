const register = require('../controllerFuncs/register')
const validate = require('../middleware/validation')
const hash = require('../middleware/hash')
const userModel = require('../models/user')
const token = require('../middleware/jwtToken')

const { Router } = require('express')
const router = Router()

router.post(
  '/',
  validate.validatePassword, 
  hash.hashNSalt, 
  userModel.create,
  token.generateAccessToken, 
  register.end, 
  register.errorHandler
)

module.exports = router