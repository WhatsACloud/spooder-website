const { sequelize, DataTypes } = require('../database')
const error = require('../middleware/error')
const User = require('../databaseModels/user')(sequelize, DataTypes)
const spoodaweb = require('../databaseModels/spoodaweb')(sequelize, DataTypes)

module.exports = {
  validate (req, res, next) {
    try {
      if (!req.body['title']) return next(error.create('Please provide title', {type: 'clientErr'}))
      next()
    } catch (err) {
      next(err)
    }
  },
  end (req, res, next) {
    res.status(201).send({data: {spoodawebId: req.body.spoodawebId, result: true, message: 'spoodaweb successfully created'}, type: true})
  }
}