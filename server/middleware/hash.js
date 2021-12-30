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
  } // note to self, please move this function to register.js as it is not used anywhere else
}