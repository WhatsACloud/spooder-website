const jwt = require('jsonwebtoken')
const error = require('./error')
const dotenv = require('dotenv')

dotenv.config({
  path: `${__dirname}/../Storage/.env`
})

module.exports = {
  generateAccessToken (req, res, next) {
    const id = req.body.id
    try {
      const token = jwt.sign({userId: id}, process.env.TOKEN_SECRET, {expiresIn: '1d'})
      req.body.token = token
      next()
    } catch (err) {
      next(err)
    }
  },
  authenticateToken (req, res, next) {
    console.log("what")
    const token = req.header('Authorization')
    // console.log(token)
    if (token === undefined) next(error.create('No authorization header provided'))
    // console.log(process.env.TOKEN_SECRET)
    const result = jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
      if (err) return next(error.create('please relogin!', {type: "tokenErr"}))
      console.log(data)
      req.body.jwtTokenData = data
      next()
    })
  }
}
