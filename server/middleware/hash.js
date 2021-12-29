const bcrypt = require('bcrypt')
const saltRounds = 10

module.exports = {
  async hashNSalt (req, res, next) {
    try {
      let password = req.body.Password
      const hash = await bcrypt.hash(password, saltRounds)
      req.body.Password = hash
      console.log(req.body.Password)
      next()
    } catch (err) {
      err.type = 'hash'
      err.message = 'An error has occured with password hashing'
      next(err)
    }
  },
  async compare (password, hash) {
    if (!(typeof password === 'string') && !(typeof hash === 'string')) return false
    console.log(typeof password, typeof hash)
    try {
      const comparison = await bcrypt.compare(password, hash)
      return comparison
    } catch (err) {
      console.log(err)
      return false
    }
  }
}