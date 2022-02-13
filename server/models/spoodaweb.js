const { sequelize, DataTypes } = require('../database')
const errorCreator = require('../middleware/errorCreator')
const User = require('../databaseModels/user')(sequelize, DataTypes)
const spoodaweb = require('../databaseModels/spoodaweb')(sequelize, DataTypes)

const lookupList = [
  'title'
]

module.exports = {
  validate (req, res, next) {
    try {
      lookupList.forEach((key, index) => {
        if (!req.body[key]) req.body[key] = ''
      })
      next()
    } catch (err) {
      next(err)
    }
  },
  async create (req, res, next) {
    const userId = req.body.jwtTokenData.userId
    try {
      const web = await spoodaweb.create({
        fk_user_id: userId,
        title: req.body.title,
        description: req.body.description,
        text: req.body.text
      })
      // console.log(web)
      req.body.spoodawebId = web.dataValues.id
      next()
    } catch (err) {
      next(err)
    }
  },
  end (req, res, next) {
    res.send({data: {spoodawebId: req.body.spoodawebId, result: true, message: 'spoodaweb successfully created'}})
  },
  errorHandler (error, req, res, next) {
    console.log(error)
    let message = 'An error occured on the server'
    if (error.type) message = error.message
    res.status(500).send({error: {message: message}})
  }
}