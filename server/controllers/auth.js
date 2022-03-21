// just to test
const error = require('../middleware/error')

const { Router } = require('express')
const router = Router()

router.post(
  '/',
  function (req, res, next) {
    console.log(req.cookies)
    res.send('a')
  },
  error.errorHandler
)

module.exports = router