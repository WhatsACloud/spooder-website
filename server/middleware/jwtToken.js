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
      res.cookie('Authorization', token, {expires: new Date(Date.now() + 1000 * 60 * 60 * 24 ), httpOnly: true})
      next()
    } catch (err) {
      next('jwtToken')
    }
  },
  authenticateToken (req, res, next) {
    const token = req.cookies.Authorization
    console.log(token)
    if (token === undefined) return next(error.create('Please relogin!'))
    // console.log(process.env.TOKEN_SECRET)
    const result = jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
      if (err) return next(error.create('Please relogin!', {type: "tokenErr"}))
      console.log(data)
      req.body.jwtTokenData = data
      next()
    })
  }
}
