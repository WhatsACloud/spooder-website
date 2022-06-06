const { sequelize, DataTypes, Op } = require('../../database')
const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const Spoodaweb = require('../../databaseModels/spoodaweb')(sequelize, DataTypes)

async function getNextObjId(spoodawebId) {
  let highestBudObjId = await Bud.max("objId", { "where": {
    fk_spoodaweb_id: spoodawebId
  }})
  let objId = 1
  if (!(isNaN(highestBudObjId))) {
    objId = highestBudObjId + 1
  }
  return objId
}
module.exports.getNextObjId = getNextObjId

const DelType = {
  NotDel: Symbol("NotDel"),
  Del: Symbol("Del"),
  Both: Symbol("Both"),
}

module.exports.DelType = DelType

const findSpoodaweb = async (spoodawebId) => {
  const spoodaweb = await Spoodaweb.findAll({
    where: {
      id: spoodawebId
    }
  })
  return spoodaweb[0] || false
}
module.exports.findSpoodaweb = findSpoodaweb  