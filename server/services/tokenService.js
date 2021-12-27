const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config({
  path: `${__dirname}/../Storage/.env`
})

module.exports = {
  generateAccessToken (id) {
    return jwt.sign({userId: id}, process.env.TOKEN_SECRET, {expiresIn: '1d'})
  },
  authenticateToken (req) {
    const token = req.header('Authorization')
    console.log(token)

    if (token === undefined) return false
    console.log(process.env.TOKEN_SECRET)
    const result = jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
      console.log(err)
      if (err) return false
      return data
    })
    return result
  }
}
