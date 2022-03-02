const { sequelize, DataTypes } = require('../database')
const bcrypt = require('bcrypt')
const User = require('../databaseModels/user')(sequelize, DataTypes)
const error = require('../middleware/error')

module.exports = {
  allFieldsFilled (req, res, next) {
    if (!(req.body.Password && (req.body.Email || req.body.Username))) {
      return next(error.create('Please fill in all required fields', {statusNo: 400}))
    }
    next()
  },
  async databaseHandler (req, res, next) {
    console.log(!(req.body.error))
    if (!(req.body.error)) {
      const user = req.body.dbUser
      req.body.dbPassword = user.dataValues.password
      req.body.id = user.dataValues.id
      next()
      return
    }
    next(error.create('User does not exist', {statusNo: 400}))
  },
  async comparePasswords (req, res, next) {
    // console.log(req.body)
    try {
      let password = req.body.Password
      let hash = req.body.dbPassword
      if (!(typeof password === 'string') || !(typeof hash === 'string')) {
        next(error.create('An error occured verifying the password'))
      }
      const comparison = await bcrypt.compare(password, hash)
      if (!comparison) {
        next(error.create('Password is incorrect'))
      }
      next()
    } catch (err) {
      next(err)
    }
  },
  end (req, res, next) {
    res.send({data: {token: req.body.token, username: req.body.Username}, type: true})
  }
}