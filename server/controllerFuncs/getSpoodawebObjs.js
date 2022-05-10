const error = require('../middleware/error')

module.exports = {
  validate (req, res, next) {
    try {
      if (!req.body.startPos || !req.body.endPos) throw error.create('The data received is invalid, this is most likely a client side error.')
      next()
    } catch (err) {
      next(err)
    }
  },
  end (req, res, next) {
    res.status(201).send({spoodawebData: req.body.spoodawebData, nextObjId: req.body.nextObjId, result: true, message: 'spoodaweb successfully retrieved'})
  }
}