module.exports = {
  end (req, res, next) {
    res.send({token: req.body.token, username: req.body.Username, type: true})
  }
}