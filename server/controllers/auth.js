const error = require('../middleware/error')
const token = require('../middleware/jwtToken')

const { Router } = require('express')
const router = Router()

router.post(
  '/',
  token.authenticateToken,
  function (req, res, next) {
    const tokenData = req.body.jwtTokenData
    res.status(200).send({type: true, Username: tokenData.Username})
  },
  error.errorHandler
)

module.exports = router