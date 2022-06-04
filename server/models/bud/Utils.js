const { sequelize, DataTypes, Op } = require('../../database')
const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const Silk = require('../../databaseModels/Silk')(sequelize, DataTypes)
const Example = require('../../databaseModels/examples')(sequelize, DataTypes)
const Spoodaweb = require('../../databaseModels/spoodaweb')(sequelize, DataTypes)

async function getNextObjId(spoodawebId) {
  let highestBudObjId = await Bud.max("objId", { "where": {
    fk_spoodaweb_id: spoodawebId
  }})
  highestBudObjId = Number(highestBudObjId)
  let highestSilkObjId = await Silk.max("objId", { "where": {
    fk_spoodaweb_id: spoodawebId
  }})
  highestSilkObjId = Number(highestSilkObjId)
  let objId
  console.log(highestBudObjId, highestSilkObjId)
  if (isNaN(highestSilkObjId) || highestBudObjId >= highestSilkObjId) {
    objId = highestBudObjId
  } else {
    objId = highestSilkObjId
  }
  objId = Number(objId)
  if (objId === null || isNaN(objId)) {
    objId = 0
  } else {
    objId += 1
  }
  console.log(objId, "a")
  return objId
}
module.exports.getNextObjId = getNextObjId

const DelType = {
  NotDel: Symbol("NotDel"),
  Del: Symbol("Del"),
  Both: Symbol("Both"),
}

module.exports.DelType = DelType

const findExamples = async (budId, deleted=DelType.NotDel) => {
  switch (deleted) {
    case DelType.NotDel:
      return await Example.findAll({
        where: { fk_bud_id: budId, deletedAt: {[Op.is]: null}}
      })
    case DelType.Del:
      return await Example.findAll({
        where: { fk_bud_id: budId, deletedAt: {[Op.not]: null}}
      })
    case DelType.Both:
      return await Example.findAll({
        where: { fk_bud_id: budId}
      })
    default:
      console.log(`Error: provided type (${deleted}) in findExamples is not in the enum 'DelType'`)
  }
}

module.exports.findExamples = findExamples 

const findSpoodaweb = async (spoodawebId) => {
  const spoodaweb = await Spoodaweb.findAll({
    where: {
      id: spoodawebId
    }
  })
  return spoodaweb[0] || false
}
module.exports.findSpoodaweb = findSpoodaweb  