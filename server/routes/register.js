const register = require('../models/register')
const validate = require('../middleware/validation')
const hash = require('../middleware/hash')
const user = require('../controllers/user')
const token = require('../middleware/jwtToken')

const { Router } = require('express')

const router = Router()

router.post(
    '/', 
    validate.validatePassword, 
    hash.hashNSalt, 
    user.create, 
    token.generateAccessToken, 
    register.end, 
    register.errorHandler
)


module.exports = router