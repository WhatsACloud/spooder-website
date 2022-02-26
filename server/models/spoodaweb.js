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
  }
}