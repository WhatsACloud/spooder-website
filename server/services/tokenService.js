const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config({
  path: `${__dirname}/../Storage/.env`
})

module.exports = {
  generateAccessToken (Username) {
    return jwt.sign({username: Username}, process.env.TOKEN_SECRET, {expiresIn: '1d'})
  },
  authenticateToken (req, res) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      console.log(err)
  
      if (err) return res.sendStatus(403)
  
      req.user = user
    })
  }
}