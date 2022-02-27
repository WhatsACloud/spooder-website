const error = require('../middleware/error')
const { sequelize, DataTypes } = require('../database')
const Spoodaweb = require('../databaseModels/spoodaweb')(sequelize, DataTypes)

const errMsg = 'The data received is invalid. This is probably a client side error.'

const required_att = [
  "pronounciation",
  "contexts",
  "examples",
  "links"
]

module.exports = {
  async validate (req, res, next) {
    try {
      const spoodaweb = await Spoodaweb.findOne({
        where: {id: req.body.spoodawebId}
      })
      if (spoodaweb === null) return next(error.create('The spoodaweb you are editing does not exist within the database, or there is a client side error.'))
      let data = req.body.spoodawebData
      if (data === undefined) return next(error.create(errMsg))
      for (const budName in data) {
        const bud = data[budName]
        switch (bud.type) {
          case undefined:
            return next(error.create(errMsg))
          case 'add':
            if (bud.data === undefined) return next(error.create(errMsg))
            for (const definitionName in bud.data) {
              required_att.forEach(att => {
                if (bud.data[definitionName][att] === undefined) return next(error.create(errMsg, {debug: att}))
              })
            }
            break
          case 'sub':
            if (bud.data.id === undefined) return next(error.create(errMsg))
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
