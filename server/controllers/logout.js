const { removeToken } = require('../middleware/jwtToken')
const error = require('../middleware/error')
const { end } = require('../controllerFuncs/logout')

const { Router } = require('express')

const router = Router()

router.patch(
  '/',
  removeToken,
  end,
  error.errorHandler
)

module.exports = router