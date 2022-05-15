const error = require('../middleware/error')

const { Router } = require('express')
const { search } = require('../models/search')
const { searchEnd } = require('../controllerFuncs/search')

const router = Router()

router.post(
  '/',
  search,
  searchEnd,
  error.errorHandler
)

module.exports = router