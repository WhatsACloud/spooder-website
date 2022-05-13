const { sequelize, DataTypes, Op } = require('../../database')

const error = require('../../middleware/error')

const User = require('../../databaseModels/user')(sequelize, DataTypes)
const Spoodaweb = require('../../databaseModels/spoodaweb')(sequelize, DataTypes)

const BudDetails = require('../../databaseModels/BudDetails/budDetails')(sequelize, DataTypes)
const Example = require('../../databaseModels/BudDetails/examples')(sequelize, DataTypes)

async function getBudsWithinRange(spoodawebId, startPos, endPos) {
  console.log(startPos, endPos)
  const objs = await Bud.findAll({
    where: {
      x: {
        [Op.and]: {
          [Op.gt]: startPos[0],
          [Op.lt]: endPos[0],
        }
      },
      y: {
        [Op.and]: {
          [Op.gt]: startPos[1],
          [Op.lt]: endPos[1],
        }
      },
      fk_spoodaweb_id: spoodawebId
    }
  }) 
  return objs
}

async function getSilksWithinRange(spoodawebId, startPos, endPos) {
  const objs = await Silk.findAll({
    where: {
      x1: {
        [Op.and]: {
          [Op.gt]: startPos[0],
          [Op.lt]: endPos[0],
        }
      },
      y1: {
        [Op.and]: {
          [Op.gt]: startPos[0],
          [Op.lt]: endPos[1],
        }
      },
      x2: {
        [Op.and]: {
          [Op.gt]: startPos[0],
          [Op.lt]: endPos[0],
        }
      },
      y2: {
        [Op.and]: {
          [Op.gt]: startPos[0],
          [Op.lt]: endPos[1],
        }
      },
      fk_spoodaweb_id: spoodawebId
    }
  }) 
  return objs
}


async function getUser(id) {
  const user = await User.findOne({
    where: {
      id: id
    }
  })
  return user
}

async function getSpoodaweb(spoodawebId) {
  const spoodaweb = await Spoodaweb.findOne({
    where: {
      id: spoodawebId
    }
  })
  return spoodaweb
}

async function getBudDetails(id) {
  const budDetails = await BudDetails.findAll({
    where: {
      fk_bud_id: id
    }
  }) 
  return budDetails
}

async function getExamples(id) {
  const examples = Example.findAll({
    where: {
      fk_budDetails_id: id
    }
  })
  return examples
}


async function get (req, res, next) {
  try {
    const toResObjs = {}
    const startPos = req.body.startPos
    const endPos = req.body.endPos
    const user = (await getUser(req.body.jwtTokenData.userId))
    if (!user) return error.create('user does not exist')
    const userId = user.dataValues.id
    const spoodaweb = await getSpoodaweb(req.body.spoodawebId)
    if (spoodaweb === null) return error.create('spoodaweb does not exist')
    if (!(userId === spoodaweb.dataValues.fk_user_id)) return error.create('requested spoodaweb is not under user')
    const spoodawebId = spoodaweb.dataValues.id
    const dbBudObjs = await getBudsWithinRange(spoodawebId, startPos, endPos)
    console.log(dbBudObjs)
    for (const dbObj of dbBudObjs) {
      const objData = dbObj.dataValues
      const objId = objData.objId
      toResObjs[objId] = {
        word: objData.word,
        definitions: [],
        position: {
          x: objData.x,
          y: objData.y
        },
        attachedTo: [], 
        type: "bud"
      }
      const budDetails = await getBudDetails(objData.id)
      let i = 0
      for (const budDetail of budDetails) {
        const budDetailData = budDetail.dataValues
        const budDetailId = budDetailData.id
        console.log(toResObjs[objId])
        toResObjs[objId].definitions.push({
          sound: '',
          definition: '',
          context: '',
          examples: [] 
        })
        toResObjs[objId].definitions[i].sound = budDetailData.sound
        toResObjs[objId].definitions[i].definition = budDetailData.definition
        toResObjs[objId].definitions[i].context = budDetailData.context
        const examplesObj = []
        const examples = await getExamples(budDetailId)
        for (const example of examples) {
          examplesObj.push(example.dataValues.example)
        }
        toResObjs[objId].definitions[i].examples.push(examplesObj)
        i++
      }
      const attachedTos = await AttachedTo.findAll({
        where: {
          fk_bud_id: objData.id
        }
      }) 
      for (const attachedTo of attachedTos) {
        const attachedToData = attachedTo.dataValues
        toResObjs[objId].attachedTo.push(attachedToData.attachedToId)
      }
    }
    const dbSilkObjs = await getSilksWithinRange(spoodawebId, startPos, endPos)
    for (const silk of dbSilkObjs) {
      const silkData = silk.dataValues
      const objId = silkData.objId
      toResObjs[objId] = {
        "positions": [],
        "strength": null,
        "attachedTo1": null,
        "attachedTo2": null,
        "type": "silk"
      }
      toResObjs[objId].positions = [
        {x: silkData.x1, y: silkData.y1},
        {x: silkData.x2, y: silkData.y2}
      ]
      toResObjs[objId].strength = silkData.strength
      toResObjs[objId].attachedTo1 = silkData.attachedTo1
      toResObjs[objId].attachedTo2 = silkData.attachedTo2
    }
    req.body.spoodawebData = toResObjs
    req.body.nextObjId = await getNextObjId(spoodawebId)
    next()
  } catch (err) {
    console.log('get spoodawebs err', err)
    next(err)
  }
}
module.exports.get = get