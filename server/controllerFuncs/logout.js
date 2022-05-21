const end = (req, res, next) => {
  res.send({ type: true })
}
module.exports.end = end