const spoodaweb = require('../controllerFuncs/spoodaweb')
const spoodawebModel = require('../models/spoodaweb')
const jwtToken = require('../middleware/jwtToken')
const { errorHandler } = require('../middleware/error')

const { Router } = require('express')
const router = Router()

router.post(
  '/create', 
  spoodaweb.validate, 
  jwtToken.authenticateToken, 
  spoodawebModel.create, 
  spoodaweb.end,
  errorHandler
)

const edit = require('../controllerFuncs/edit')
const editSpoodawebModel = require('../models/bud')

router.post(
  '/edit',
  edit.validate,
  jwtToken.authenticateToken,
  editSpoodawebModel.edit,
  edit.end,
  errorHandler
  // NOTE TO SELF: PLEASE LOAD BUDS IN ORDER, DO NOT LOAD ALL AT ONCE OR COMPUTER WILL SELF DESTRUCT
)

const getSpoodawebs = require('../controllerFuncs/getSpoodawebs')

router.get(
  '/get',
  jwtToken.authenticateToken,
  spoodawebModel.get,
  getSpoodawebs.end,
  errorHandler
)

module.exports = router