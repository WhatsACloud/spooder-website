const { sequelize, DataTypes, Op } = require('../../database')

const error = require('../../middleware/error')

const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const AttachedTo = require('../../databaseModels/AttachedTo')(sequelize, DataTypes)

const { Cbud } = require('../../utils/bud')

const getEntireBud = async (spoodawebId) => {
  const _buds = await Bud.findAll({where: {
    fk_spoodaweb_id: spoodawebId
  }})
  const buds = {}
  for (const _bud of _buds) {
    const objId = _bud.dataValues.objId
    const _attachedTo = await AttachedTo.findAll({where: {
      fk_bud_id: bud.id
    }})

  }
  return buds
}
module.exports.getEntireBud = getEntireBud