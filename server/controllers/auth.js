const error = require('../middleware/error')
const token = require('../middleware/jwtToken')

const { Router } = require('express')
const router = Router()

router.post(
  '/',
  function (req, res, next) {
    res.status(200).send({type: true})
  },
  error.errorHandler
)

module.exports = router