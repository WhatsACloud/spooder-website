const jwt = require('jsonwebtoken')
const errorCreate = require('../helperFunctions/errorCreator')
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
    const token = req.header('Authorization')
    // console.log(token)
    if (token === undefined) next( errorCreate( 'No authorization header provided', {type: true} ) )
    // console.log(process.env.TOKEN_SECRET)
    const result = jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
      if (err) next(err)
      console.log(data)
      req.body.jwtTokenData = data
      next()
    })
  }
}
