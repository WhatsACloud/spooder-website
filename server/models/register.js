module.exports = {
  end (req, res, next) {
    res.send({token: req.body.token})
  },
  errorHandler (error, req, res, next) {
    console.log(error)
    let data
    switch (error.type) {
      case 'database':
        data = {message: error.errors[0].message}
        break
      case 'validation':
        data = {message: error.details[0].message}
        break
      case 'hash':
        data = {message: error.message}
        break
      default:
        data = {message: 'An error has occured'}
        break
    }
    data.type = error.type
    res.status(500).send(data)
  }
}