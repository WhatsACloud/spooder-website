const register = require('../controllerFuncs/register')
const hash = require('../middleware/hash')
const userModel = require('../models/user')
const token = require('../middleware/jwtToken')
const error = require('../middleware/error')

const { Router } = require('express')
const router = Router()

router.post(
  '/',
  register.validatePassword,
  hash.hashNSalt,
  token.generateAccessToken,
  userModel.create,
  register.end, 
  error.errorHandler
)

module.exports = router