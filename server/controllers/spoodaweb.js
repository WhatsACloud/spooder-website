const spoodaweb = require('../models/spoodaweb')
const jwtToken = require('../middleware/jwtToken')

const { Router } = require('express')
const router = Router()

router.post(
  '/create', 
  spoodaweb.validate, 
  jwtToken.authenticateToken, 
  spoodaweb.create, 
  spoodaweb.end, 
  spoodaweb.errorHandler
)

module.exports = router