const { sequelize, DataTypes } = require('../database')
const bud = require('../databaseModels/bud')(sequelize, DataTypes)
const budDetails = require('../databaseModels/budDetails')(sequelize, DataTypes)

module.exports = {
  async edit (req, res, next) {
    const userId = req.body.jwtTokenData.userId
    console.log(userId)
    try {
      let data = req.body.spoodawebData
      for (const budName in data) {
        const Bud = data[budName]
        const _bud = await bud.create({
          fk_spoodaweb_id: req.body.spooderwebId,
          word: budName
        })
        const budId = _bud.dataValues.id
        for (const definitionName in Bud) {
          const definition = Bud[definitionName]
          const _budDetails = budDetails.create({
            fk_bud_id: budId,
            definition: definitionName,
            pronounciation: definition.pronounciation
          })
        } 
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}