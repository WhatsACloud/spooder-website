const { sequelize, DataTypes } = require('../database')
const bud = require('../databaseModels/bud')(sequelize, DataTypes)

module.exports = {
  async edit (req, res, next) {
    const userId = req.body.jwtTokenData.userId
    console.log(userId)
    try {
      let data = req.body.spoodawebData
      for (budName in data) {
        const Bud = data[budName]
        const _bud = await bud.create({
          fk_spoodaweb_id: req.body.spooderwebId,
          word: budName
        })
        console.log(_bud)
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}