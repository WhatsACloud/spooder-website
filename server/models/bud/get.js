const { sequelize, DataTypes, Op } = require('../../database')

const error = require('../../middleware/error')
const Utils = require('./Utils')

const User = require('../../databaseModels/user')(sequelize, DataTypes)
const Spoodaweb = require('../../databaseModels/spoodaweb')(sequelize, DataTypes)

const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const AttachedTo = require('../../databaseModels/AttachedTo')(sequelize, DataTypes)

const { getCategories } = require('./categories')

const { Cbud } = require('../../utils/bud')

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


async function getUser(id) {
  const user = await User.findOne({
    where: {
      id: id
    }
  })
  return user
}

async function getSpoodaweb(userId, spoodawebId) {
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
    const dbBudObjs = await Bud.findAll({ where : {
      fk_spoodaweb_id: spoodawebId,
      deletedAt: {[Op.is]: null},
    }})
    console.log(dbBudObjs)
    for (const dbObj of dbBudObjs) {
      const objData = dbObj.dataValues
      const objId = objData.objId
      if (typeof objId === 'number') {
        toResObjs[objId] = new Cbud({
          word: objData.word,
          definition: objData.definition,
          sound: objData.sound,
          context: objData.context,
          example: objData.example,
          link: objData.link,
          categId: objData.categ_id || 0,
          position: {x: objData.x, y: objData.y},
          objId: objId,
        })
        const attachedTos = await AttachedTo.findAll({
          where: {
            fk_bud_id: objData.id,
            deletedAt: {
              [Op.is]: null
            }
          }
        }) 
        const toAttachedTos = []
        for (const attachedTo of attachedTos) {
          const attachedToData = attachedTo.dataValues
          toAttachedTos.push(attachedToData.attachedToId)
        }
        toResObjs[objId].setJSONAttr('attachedTos', toAttachedTos)
        toResObjs[objId] = toResObjs[objId].toJSON()
      }
    }
    req.body.spoodawebData = toResObjs
    const categories = await getCategories(spoodawebId)
    req.body.categories = {}
    for (const category of categories) {
      req.body.categories[category.dataValues.categId] = {
        color: category.dataValues.color,
        name: category.dataValues.name,
      }
    }
    req.body.nextObjId = await Utils.getNextObjId(spoodawebId)
    console.log(toResObjs)
    next()
  } catch (err) {
    console.log('get spoodawebs err', err)
    next(err)
  }
}
module.exports.get = get