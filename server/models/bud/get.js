const { sequelize, DataTypes, Op } = require('../../database')

const error = require('../../middleware/error')
const Utils = require('./Utils')

const User = require('../../databaseModels/user')(sequelize, DataTypes)
const Spoodaweb = require('../../databaseModels/spoodaweb')(sequelize, DataTypes)

const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const AttachedTo = require('../../databaseModels/AttachedTo')(sequelize, DataTypes)
const Silk = require('../../databaseModels/Silk')(sequelize, DataTypes)

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
      fk_spoodaweb_id: spoodawebId,
      deletedAt: {
        [Op.is]: null
      }
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

async function getSpoodaweb(userId, spoodawebId) {
  console.log('xue hua zhe piao piao', spoodawebId)
  const spoodaweb = await Spoodaweb.findOne({
    where: {
      fk_user_id: userId,
      id: spoodawebId
    }
  })
  return spoodaweb
}

async function get (req, res, next) {
  try {
    const toResObjs = {}
    const startPos = req.body.startPos
    const endPos = req.body.endPos
    const user = (await getUser(req.body.jwtTokenData.userId))
    if (!user) throw error.create('user does not exist')
    const userId = user.dataValues.id
    const spoodaweb = await getSpoodaweb(userId, req.body.spoodawebId)
    if (spoodaweb === null) throw error.create('spoodaweb does not exist')
    // if (!(userId === spoodaweb.dataValues.fk_user_id)) throw error.create('requested spoodaweb is not under user')
    const spoodawebId = spoodaweb.dataValues.id
    const dbBudObjs = await getBudsWithinRange(spoodawebId, startPos, endPos)
    console.log(dbBudObjs)
    for (const dbObj of dbBudObjs) {
      const objData = dbObj.dataValues
      const objId = objData.objId
      if (typeof objId === 'number') {
        toResObjs[objId] = {
          word: objData.word,
          definitions: [],
          position: {
            x: objData.x,
            y: objData.y
          },
          attachedTo: {}, 
          type: "bud"
        }
        // const budDetails = await getBudDetails(objData.id)
        const budDetails = null
        for (const budDetail of budDetails) {
          const budDetailData = budDetail.dataValues
          const budDetailId = budDetailData.id
          console.log(toResObjs[objId])
          toResObjs[objId].definitions.push({
            sound: '',
            definition: '',
            context: '',
            examples: [],
            link: null,
            arrID: null
          })
          const index = toResObjs[objId].definitions.length-1
          toResObjs[objId].definitions[index].sound = budDetailData.sound
          toResObjs[objId].definitions[index].definition = budDetailData.definition
          toResObjs[objId].definitions[index].context = budDetailData.context
          toResObjs[objId].definitions[index].link = budDetailData.link
          toResObjs[objId].definitions[index].arrID = budDetailData.arrID
          for (const [ exampleIndex, example ] of Object.entries(examples)) {
            const exampleData = example.dataValues
            toResObjs[objId].definitions[index].examples.push({
              text: exampleData.example,
              arrID: exampleData.arrID
            })
          }
        }
        const attachedTos = await AttachedTo.findAll({
          where: {
            fk_bud_id: objData.id,
            deletedAt: {
              [Op.is]: null
            }
          }
        }) 
        for (const attachedTo of attachedTos) {
          const attachedToData = attachedTo.dataValues
          toResObjs[objId].attachedTo[attachedToData.attachedToId] = attachedToData.innerIndex
        }
      }
    }
    const dbSilkObjs = await getSilksWithinRange(spoodawebId, startPos, endPos)
    for (const silk of dbSilkObjs) {
      const silkData = silk.dataValues
      const objId = silkData.objId
      if (typeof objId === 'number') {
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
    }
    req.body.spoodawebData = toResObjs
    req.body.nextObjId = await Utils.getNextObjId(spoodawebId)
    console.log(toResObjs)
    next()
  } catch (err) {
    console.log('get spoodawebs err', err)
    next(err)
  }
}
module.exports.get = get