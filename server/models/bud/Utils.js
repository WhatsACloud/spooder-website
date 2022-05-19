const { sequelize, DataTypes, Op } = require('../../database')
const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const Silk = require('../../databaseModels/Silk')(sequelize, DataTypes)

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
  return objId
}
module.exports.getNextObjId = getNextObjId