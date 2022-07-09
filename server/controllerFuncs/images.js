const error = require('../middleware/error')

const del = (req, res, next) => {

}
module.exports.delete = del

const end = (req, res, next) => {
  res.send({ type: true, filename: req.file.filename })
}
module.exports.end = end