const { randomUUID } = require('crypto')

const images = require('../controllerFuncs/images')
const imagesModel = require('../models/images')
const error = require('../middleware/error')

const jwtToken = require('../middleware/jwtToken')

const { Router } = require('express')

const router = Router()

const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
    const sep = file.originalname.split('.')
    const extension = sep[sep.length-1]
    cb(null, `${randomUUID()}.${extension}`)
  }
})

const upload = multer({ storage })

router.post(
  '/set',
  upload.single('image'),
  jwtToken.authenticateToken,
  imagesModel.save,
  images.setEnd,
  error.errorHandler,
)

router.delete(
  '/set',
  images.delete,
  error.errorHandler,
)

router.post(
  '/get/default',
  jwtToken.authenticateToken,
  images.getEnd,
  error.errorHandler,
)

router.post(
  '/get/backgrounds',
  jwtToken.authenticateToken,
  images.getEnd,
  error.errorHandler,
)

module.exports = router