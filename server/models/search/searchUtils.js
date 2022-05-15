const { sequelize, DataTypes, Op } = require('../../database')

const error = require('../../middleware/error')

const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const BudDetails = require('../../databaseModels/BudDetails/budDetails')(sequelize, DataTypes)
const Example = require('../../databaseModels/BudDetails/examples')(sequelize, DataTypes)
const AttachedTo = require('../../databaseModels/BudDetails/AttachedTo')(sequelize, DataTypes)

const getEntireBud = async (spoodawebId) => {
  const _buds = await Bud.findAll({where: {
    fk_spoodaweb_id: spoodawebId
  }})
  const buds = {}
  for (const bud of _buds) {
    buds[bud.dataValues.objId] = {
      bud: bud,
      budDetails: [],
      examples: [],
      attachedTo: []
    }
  }
  for (const [objId, budObj] of Object.entries(buds)) {
    const bud = budObj.bud
    const _attachedTo = await AttachedTo.findAll({where: {
      fk_bud_id: bud.dataValues.id
    }})
    const _budDetails = await BudDetails.findAll({where: {
      fk_bud_id: bud.dataValues.id
    }})
    for (const budDetail of _budDetails) {
      const _examples = await Example.findAll({
        where: {
          fk_budDetails_id: budDetail.dataValues.id
        }
      })
      buds[objId].examples.push(..._examples)
    }
    buds[objId].attachedTo.push(..._attachedTo)
    buds[objId].budDetails.push(..._budDetails)
  }
  console.log(buds, "buds")
  return buds
}
module.exports.getEntireBud = getEntireBud