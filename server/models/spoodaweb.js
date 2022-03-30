const { sequelize, DataTypes } = require('../database')
const spoodaweb = require("../databaseModels/spoodaweb")(sequelize, DataTypes)

module.exports = {
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
  async get (req, res, next) {
    try {
      const webs = await spoodaweb.findAll({
        where: {
          fk_user_id: req.body.jwtTokenData.userId
        }
      })
      req.body.webs = webs
      next()
    } catch(err) {
      console.log(err)
      next(err)
    }
  }
}