const { sequelize, DataTypes, Op } = require('../../database')
const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const Silk = require('../../databaseModels/Silk')(sequelize, DataTypes)
const AttachedTo = require('../../databaseModels/AttachedTo')(sequelize, DataTypes)
const error = require('../../middleware/error')
const Utils = require('./Utils')

async function findBud(spoodawebId, objId, deleted=Utils.DelType.NotDel, transaction) {
  const query = {
    where: {
      fk_spoodaweb_id: spoodawebId,
      objId: objId,
      deletedAt: {[Op.is]: null}
    }
  }
  switch (deleted) {
    case Utils.DelType.Both:
      delete query.where.deletedAt
      break
    case Utils.DelType.Del:
      query.where.deletedAt = {[Op.not]: null}
      break
  }
  const possibleDbBud = await Bud.findOne(query)
  if (possibleDbBud === null) return false
  // if (possibleDbBud.length > 0) { // self correction system
  //   const bud = possibleDbBud.shift()
  //   for (const dbBud of possibleDbBud) {
  //     dbBud.update({
  //       objId: await getNextObjId(spoodawebId)
  //     }, {transaction: transaction})
  //   }
  //   return bud
  // }
  return possibleDbBud
}

async function markForDeletion(obj, t) { // TO DO: add links thingy
  if (obj === null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  if (obj.dataValues.deletedAt === null) {
    await obj.update({"deletedAt": Date.now()}, {transaction: t})
  } else {
    console.log('already deleted')
  }
}

async function markBudForDeletion(spoodawebId, budId, transaction) {
  const obj = await Bud.findOne({where: {fk_spoodaweb_id: spoodawebId, objId: budId}}, {transaction, transaction})
  if (obj === null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  if (obj.dataValues.deletedAt !== null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  await obj.update({"deletedAt": Date.now()}, {transaction: transaction})
}

async function createBud(spoodawebId, objId, obj, transaction) {
  const possibleDbBud = await findBud(spoodawebId, objId, transaction)
  if (possibleDbBud !== false) return false
  const _bud = await Bud.create({
    fk_spoodaweb_id: spoodawebId,
    objId: objId,
    word: obj.word,
    x: obj.position.x,
    y: obj.position.y,
    example: obj.example,
    definition: obj.definition,
    sound: obj.sound,
    context: obj.context,
    link: obj.link,
  }, {transaction: transaction})
  return _bud
}

async function createAttachedTo(attachedToId, innerIndex, fk_bud_id, transaction) {
  await AttachedTo.create({
    attachedToId: attachedToId,
    fk_bud_id: fk_bud_id,
    innerIndex: innerIndex
  }, {transaction: transaction})
}

async function editAttachedTo(budId, attachedTo, transaction) {
  const _attachedTos = await AttachedTo.findAll({
    where: {
      fk_bud_id: budId
    }
  })
  // for (_attachedTo of _attachedTos) {
  //   await _attachedTo.destroy({transaction: transaction})
  // }
  for (const [ index, attachedToId ] of Object.keys(attachedTo).entries()) {
    if (_attachedTos[index]) {
      const innerIndex = attachedTo[attachedToId]
      _attachedTos[index].update({
        attachedToId: attachedToId,
        innerIndex: innerIndex
      })
    } else {
      const innerIndex = attachedTo[attachedToId]
      await createAttachedTo(attachedToId, innerIndex, budId, transaction)
    }
  }
  return _attachedTos
}

async function createSilk(spoodawebId, positions, strength, objId, attachedTo1, attachedTo2, transaction) {
  const silk = await Silk.create({
    fk_spoodaweb_id: spoodawebId,
    x1: positions[0].x,
    y1: positions[0].y,
    x2: positions[1].x,
    y2: positions[1].y,
    attachedTo1: attachedTo1,
    attachedTo2: attachedTo2,
    objId: objId,
    strength: strength
  }, {transaction: transaction})
  return silk
}

async function editSilk(spoodawebId, positions, strength, objId, attachedTo1, attachedTo2, transaction) {
  const silk = await Silk.findOne({
    where: {
     fk_spoodaweb_id: spoodawebId,
     objId: objId 
    }
  })
  if (silk === null) return false
  await silk.update({
    x1: positions[0].x,
    y1: positions[0].y,
    x2: positions[1].x,
    y2: positions[1].y,
    attachedTo1: attachedTo1,
    attachedTo2: attachedTo2,
    strength: strength
  }, {transaction: transaction})
  return silk
}

async function editBud(spoodawebId, objId, obj, transaction) {
  const bud = await findBud(spoodawebId, objId, Utils.DelType.Both, transaction)
  if (bud === false) return false 
  // const bud = await Bud.findOne({ where: { fk_spoodaweb_id: spoodawebId, objId: objId }})
  // if (bud === null) return false
  const query = {
    word: obj.word,
    x: obj.position.x,
    y: obj.position.y,
    definition: obj.definition,
    sound: obj.sound,
    context: obj.context,
    link: obj.link,
  }
  if (obj.restore) {
    query.deletedAt = null
  }
  await bud.update(query, {transaction: transaction})
  return bud 
}

const addBud = async (spoodawebId, obj, objId, transaction) => {
  const _budId = await createBud(spoodawebId, objId, obj, transaction)
  if (_budId === false) throw error.create(`object ${objId-1} (bud) already exists within database.`)
  objId += 1
  const budId = _budId.dataValues.id
  let i = 0
  for (const attachedToId of Object.keys(obj.attachedTos)) {
    const innerIndex = obj.attachedTo[attachedToId]
    await createAttachedTo(attachedToId, i, budId, transaction)
    i++
  }
}

const completeEditBud = async (spoodawebId, clientObjId, objId, obj, transaction) => {
  if (!obj.del) {
    const bud = await editBud(spoodawebId, clientObjId, obj, transaction)
    if (bud === false) {
      return false
    }
    const budId = bud.dataValues.id
    await editAttachedTo(budId, obj.attachedTos, transaction)
  } else {
    console.log(clientObjId)
    await markBudForDeletion(spoodawebId, clientObjId, transaction)
  }
}

module.exports = { // please add support for positions, budId
  async edit (req, res, next) {
    let transaction
    try {
      const userId = req.body.jwtTokenData.userId
      const data = req.body.spoodawebData
      const spoodawebId = req.body.spoodawebId
      transaction = await sequelize.transaction()
      let objId = await Utils.getNextObjId(spoodawebId)
      if (await Utils.findSpoodaweb(spoodawebId) === false) throw error.create('The spoodaweb you are editing does not exist or has been deleted.')
      for (const [ clientObjId, obj ] of Object.entries(data)) {
        const bud = await completeEditBud(spoodawebId, clientObjId, objId, obj, transaction)
        if (bud === false) {
          await addBud(spoodawebId, obj, objId, transaction)
          objId++
        }
      }
      await transaction.commit()
      next()
    } catch (err) {
      await transaction.rollback()
      next(err)
    }
  }
}