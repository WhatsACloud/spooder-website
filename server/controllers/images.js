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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const sep = file.originalname.split('.')
    const extension = sep[sep.length-1]
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`)
  }
})

const upload = multer({ storage })

router.post(
  '/set',
  upload.single('image'),
  jwtToken.authenticateToken,
  imagesModel.save,
  images.end,
  error.errorHandler,
)

router.delete(
  '/set',
  images.delete,
  error.errorHandler,
)

router.post(
  '/get',
)

module.exports = router