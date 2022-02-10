const loginController = require('../controllers/user')
const login = require('../models/login')
const jwtToken =  require('../middleware/jwtToken')

const { Router } = require('express')

const router = Router()

router.post(
    "/",
    login.allFieldsFilled,
    loginController.find,
    login.databaseHandler, 
    login.comparePasswords, 
    jwtToken.generateAccessToken, 
    login.end, 
    login.errorHandler
)

module.exports = router
// note to self, controllers are for databases