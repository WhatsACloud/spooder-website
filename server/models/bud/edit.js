const { sequelize, DataTypes, Op } = require('../../database')
const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const Silk = require('../../databaseModels/Silk')(sequelize, DataTypes)
const Example = require('../../databaseModels/examples')(sequelize, DataTypes)
const AttachedTo = require('../../databaseModels/AttachedTo')(sequelize, DataTypes)
const error = require('../../middleware/error')
const Utils = require('./Utils')

async function findBud(spoodawebId, objId, transaction) {
  const possibleDbBud = await Bud.findAll({
    where: {
      fk_spoodaweb_id: spoodawebId,
      objId: objId,
      deletedAt: {[Op.is]: null}
    }
  })
  if (possibleDbBud === null) return false
  if (possibleDbBud.length > 0) { // self correction system
    const bud = possibleDbBud.shift()
    for (const dbBud of possibleDbBud) {
      dbBud.update({
        objId: await getNextObjId(spoodawebId)
      }, {transaction: transaction})
    }
    return bud
  }
  return false
}

async function markForDeletion(obj, t) { // TO DO: add links thingy
  if (obj === null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  if (obj.dataValues.deletedAt === null) {
    await obj.update({"deletedAt": Date.now()}, {transaction: t})
  } else {
    console.log('already deleted')
  }
}

async function markExampleForDeletion(budId, exampleId, transaction) {
  const example = await Example.findOne({
    where: {fk_bud_id: budId, arrID: exampleId}
  })
  await markForDeletion(example, transaction)
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

async function createExample(budId, example, arrID, transaction) {
  await Example.create({
    fk_bud_id: budId,
    arrID: arrID,
    example: example
  }, {transaction: transaction})
}

async function editBud(spoodawebId, objId, word, position, transaction) {
  const possibleDbBud = await findBud(spoodawebId, objId, transaction)
  if (possibleDbBud === false) return false 
  const bud = await Bud.findOne({ where: { fk_spoodaweb_id: spoodawebId, objId: objId }})
  if (bud === null) return null 
  await bud.update({
    word: word,
    x: position.x,
    y: position.y
  }, {transaction: transaction})
  return bud 
}

async function editExamples(budId, newExamples, transaction) {
  const examples = Utils.findExamples(budId, Utils.DelType.NotDel)
  for (const [ index, newExample ] of Object.entries(newExamples)) {
    if (!newExample.del) {
      const example = examples[index]
      console.log(example)
      if (newExamples.length === 0) return null
      if (example !== undefined) {
        await example.update({
          example: newExample.text,
          arrID: newExample.arrID
        }, {transaction: transaction})
      } else {
        await createExample(budId, newExample.text, newExample.arrID, transaction)
      }
    } else {
      await markExampleForDeletion(budId, newExample.arrID, transaction)
    }
  }
}

const addBud = async (spoodawebId, obj, objId, transaction) => {
  const _budId = await createBud(spoodawebId, objId, obj, transaction)
  if (_budId === false) throw error.create(`object ${objId-1} (bud) already exists within database.`)
  objId += 1
  const budId = _budId.dataValues.id
  await editExamples(budId, obj.examples, transaction)
  let i = 0
  for (const attachedToId of Object.keys(obj.attachedTo)) {
    const innerIndex = obj.attachedTo[attachedToId]
    await createAttachedTo(attachedToId, i, budId, transaction)
    i++
  }
}

const completeEditBud = async (spoodawebId, clientObjId, objId, obj, transaction) => {
  if (!obj.del) {
    const bud = await editBud(spoodawebId, clientObjId, obj.word, obj.position, transaction)
    if (bud === false) {
      return false
    }
    const budId = bud.dataValues.id
    for (const definition of obj.definitions) {
      if (!definition.del) {
        // await editExamples(_budDetailsId.dataValues.id, definition.examples, transaction)
      } else {
        await markBudDetailForDeletion(budId, definition.arrID, transaction)
      }
    }
    await editAttachedTo(budId, obj.attachedTo, transaction)
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
        switch (obj.type) {
          case "bud":
            const bud = await completeEditBud(spoodawebId, clientObjId, objId, obj, transaction)
            if (bud === false) {
              await addBud(spoodawebId, obj, objId, transaction)
              objId++
            }
            break
          case "silk":
            const silk = await editSilk(spoodawebId, obj.positions, obj.strength, clientObjId, obj.attachedTo1, obj.attachedTo2, transaction)
            if (!silk) {
              await createSilk(spoodawebId, obj.positions, obj.strength, objId, obj.attachedTo1, obj.attachedTo2, transaction) 
              objId++
            }
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