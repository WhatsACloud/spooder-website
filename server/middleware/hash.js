const bcrypt = require('bcrypt')
const error = require('../middleware/error')
const saltRounds = 10

module.exports = {
  async hashNSalt (req, res, next) {
    try {
      let password = req.body.Password
      const hash = await bcrypt.hash(password, saltRounds)
      req.body.Password = hash
      next()
    } catch (err) {
      next('hash')
    }
  } // note to self, please move this function to register.js as it is not used anywhere else
}