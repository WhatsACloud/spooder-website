const searchEnd = (req, res, next) => {
  res.send({type: true, buds: req.body.buds})
}
module.exports.searchEnd = searchEnd