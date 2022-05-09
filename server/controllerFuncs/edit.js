const error = require('../middleware/error')
const { sequelize, DataTypes } = require('../database')
const Spoodaweb = require('../databaseModels/spoodaweb')(sequelize, DataTypes)

const errMsg = 'The data received is invalid. This is probably a client side error.'

module.exports = {
  async validate (req, res, next) {
    try {
      const spoodaweb = await Spoodaweb.findOne({
        where: {id: req.body.spoodawebId}
      })
      if (spoodaweb === null) return next(error.create('The spoodaweb you are editing does not exist within the database, or there is a client side error.'), {statusNo: 400})
      let data = req.body.spoodawebData
      if (data === undefined) return next(error.create(errMsg, {statusNo: 400}))
      for (const budName in data) {
        const bud = data[budName]
        switch (bud.operation) {
          case undefined:
            return next(error.create(errMsg))
          case 'sub':
            if (bud.data.id === undefined) return next(error.create(errMsg, {statusNo: 400}))
            break
        }
        next()
      }
    } catch(err) {
      
      next(err)
    }
  },
  async end (req, res, next) {
    res.send({type: true, message: 'spoodaweb successfully saved'})
  }
}
