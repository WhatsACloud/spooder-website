const { sequelize, DataTypes, Op } = require('../../database')

const error = require('../../middleware/error')

const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const AttachedTo = require('../../databaseModels/AttachedTo')(sequelize, DataTypes)

const dbBudToData = (dbBud) => {
  const newBud = {
    "word": dbBud.dataValues.word,
    "definitions": [],
    "attachedTo": [],
    "position": {},
    "type": "bud", // bud silk
    "id": dbBud.dataValues.id
  }
  return newBud
}

const getEntireBud = async (spoodawebId) => {
  const _buds = await Bud.findAll({where: {
    fk_spoodaweb_id: spoodawebId
  }})
  const buds = {}
  for (const bud of _buds) {
    buds[bud.dataValues.objId] = dbBudToData(bud) 
  }
  for (const [objId, bud] of Object.entries(buds)) {
    const _attachedTo = await AttachedTo.findAll({where: {
      fk_bud_id: bud.id
    }})
    const _budDetails = await BudDetails.findAll({where: {
      fk_bud_id: bud.id
    }})
    for (const [ definitionId, budDetail ] of _budDetails.entries()) {
      buds[objId].definitions[definitionId] = {
        "definition": "",
        "sound": "",
        "context": "",
        "examples": [],
        "link": 0 
      }
      buds[objId].definitions[definitionId].definition = budDetail.dataValues.definition
      buds[objId].definitions[definitionId].sound = budDetail.dataValues.sound
      buds[objId].definitions[definitionId].context = budDetail.dataValues.context
      buds[objId].definitions[definitionId].link = budDetail.dataValues.link
    }
    for (const [ attachedToId, attachedTo ] of _attachedTo.entries()) {
      buds[objId].attachedTo.push(attachedTo.dataValues.attachedToId)
    }
  }
  return buds
}
module.exports.getEntireBud = getEntireBud