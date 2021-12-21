const bcrypt = require('bcrypt')
const saltRounds = 10

module.exports = {
  async hashNSalt (password) {
    try {
      const hash = await bcrypt.hash(password, saltRounds)
      console.log(hash)
      return hash
    } catch (err) {
      console.log(err)
      return err
    }
  },
  async compare (password, hash) {
    try {
      const comparison = await bcrypt.compare(password, hash)
      return comparison
    } catch (err) {
      console.log(err)
      return false
    }
  }
}