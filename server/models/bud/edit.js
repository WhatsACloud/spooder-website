const { sequelize, DataTypes, Op } = require('../../database')
const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const Silk = require('../../databaseModels/Silk')(sequelize, DataTypes)
const BudDetails = require('../../databaseModels/BudDetails/budDetails')(sequelize, DataTypes)
const Example = require('../../databaseModels/BudDetails/examples')(sequelize, DataTypes)
const AttachedTo = require('../../databaseModels/BudDetails/AttachedTo')(sequelize, DataTypes)
const error = require('../../middleware/error')
const Utils = require('./Utils')

async function findBud(spoodawebId, objId, transaction) {
  const possibleDbBud = await Bud.findAll({
    where: {
      fk_spoodaweb_id: spoodawebId,
      objId: objId
    }
  })
  console.log(possibleDbBud)
  if (possibleDbBud === null) return false
  if (possibleDbBud.length > 0) { // self correction system
    const bud = possibleDbBud.shift()
    for (const dbBud of possibleDbBud) {
      dbBud.update({
        objId: await getNextObjId(spoodawebId)
      }, {transaction: transaction})
    }
    console.log(possibleDbBud)
    return bud
  }
  return false
}

async function findBudDetail(budId, budDetailId, t) {
  const possibleDbBudDetail = await BudDetails.findAll({
    where: {
      fk_bud_id: budId,
      arrID: budDetailId
    },
  }, {transaction: transaction})
  if (possibleDbBudDetail === null) return false
  if (possibleDbBudDetail.length > 0) { // self correction system
    const toReturn = possibleDbBudDetail.shift()
    for (const dbBud of possibleDbBudDetail) {
      dbBud.update({
        objId: await getNextObjId(spoodawebId)
      }, {transaction: transaction})
    }
    console.log(possibleDbBudDetail)
    return toReturn
  }
  return false
}

async function markForDeletion(obj, t) { // TO DO: add links thingy
  if (obj === null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  await obj.update({"deletedAt": Date.now()}, {transaction: t})
}

async function markBudDetailForDeletion(budId, budDetailId, transaction) {
  const budDetails = await BudDetails.findOne({
    where: {fk_bud_id: budId, arrID: budDetailId}})
  console.log(budDetailId, budId, budDetailId)
  await markForDeletion(budDetails, transaction)
}

async function markExampleForDeletion(budDetailId, exampleId, transaction) {
  const example = await Example.findOne({
    where: {fk_budDetails_id: budDetailId, arrID: exampleId}
  })
  console.log(example, budDetailId, exampleId)
  await markForDeletion(example, transaction)
}

async function markBudForDeletion(budId, transaction) {
  const obj = await Bud.findOne({where: {id: budId}}, {transaction, transaction})
  if (obj === null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  if (obj.dataValues.deletedAt !== null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  await obj.update({"deletedAt": Date.now()}, {transaction: transaction})
}

async function createBud(spoodawebId, word, objId, position, transaction) {
  const possibleDbBud = await findBud(spoodawebId, objId, transaction)
  if (possibleDbBud !== false) return false
  const _bud = await Bud.create({
    fk_spoodaweb_id: spoodawebId,
    word: word,
    x: position.x,
    y: position.y,
    objId: objId,
    type: "bud"
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

async function createBudDetails(budId, id, definition, sound, context, link, transaction) {
  const budDetails = await BudDetails.create({
    fk_bud_id: budId,
    definition: definition,
    sound: sound,
    link: link,
    context: context,
    arrID: id
  }, {transaction: transaction})
  return budDetails
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

async function createExample(budDetailsId, example, arrID, transaction) {
  await Example.create({
    fk_budDetails_id: budDetailsId,
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

async function editBudDetails(budId, id, definition, sound, link, context, transaction) {
  const budDetails = await BudDetails.findOne({ where: { fk_bud_id: budId, arrID: id }})
  if (budDetails === null) {
    return await createBudDetails(budId, id, definition, sound, context, link, transaction)
  } 
  await budDetails.update({
    definition: definition,
    sound: sound,
    link: link,
    context: context
  }, {transaction: transaction})
  return budDetails
}

async function editExamples(budDetailsId, newExamples, transaction) {
  const examples = await Example.findAll({ where: { fk_budDetails_id: budDetailsId }})
  if (newExamples.length === 0) return null
  for (const [ index, newExample ] of Object.entries(newExamples)) {
    const example = examples[index]
    console.log(newExample.arrID, example, newExample)
    if (example !== undefined) {
      await example.update({
        example: newExample.text,
        arrID: newExample.arrID
      }, {transaction: transaction})
    } else {
      await createExample(budDetailsId, newExample.text, newExample.arrID, transaction)
    }
  }
}

const addBud = async (spoodawebId, obj, objId, transaction) => {
  const _budId = await createBud(spoodawebId, obj.word, objId, obj.position, transaction)
  if (_budId === false) throw error.create(`object ${objId-1} (bud) already exists within database.`)
  objId += 1
  const budId = _budId.dataValues.id
  const definitionIds = obj.definitions
  for (const definition of definitionIds) {
    const _budDetailsId = await createBudDetails(budId, definition.arrID, definition.definition, definition.sound, definition.context, definition.link, transaction)
    const budDetailsId = _budDetailsId.dataValues.id
    const examples = definition.examples
    await editExamples(budDetailsId, examples, transaction)
  }
  let i = 0
  for (const attachedToId of Object.keys(obj.attachedTo)) {
    const innerIndex = obj.attachedTo[attachedToId]
    await createAttachedTo(attachedToId, i, budId, transaction)
    i++
  }
}

const completeEditBud = async (spoodawebId, clientObjId, objId, obj, transaction) => {
  const bud = await editBud(spoodawebId, clientObjId, obj.word, obj.position, transaction)
  if (bud === false) {
    return false
  }
  const budId = bud.dataValues.id
  console.log(obj.definitions)
  for (const definition of obj.definitions) {
    const _budDetailsId = await editBudDetails(budId, definition.arrID, definition.definition, definition.sound, definition.link, definition.context, transaction)
    if (_budDetailsId === null) throw error.create('details does not exist')
    await editExamples(_budDetailsId.dataValues.id, definition.examples, transaction)
  }
  await editAttachedTo(budId, obj.attachedTo, transaction)
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
      for (const [ clientObjId, obj ] of Object.entries(data)) {
        switch (obj.operation) {
          case "sub":
            if (obj.del === "bud") {
              await markBudForDeletion(clientObjId, transaction)
            } else if (obj.del === "other") {
              const bud = await findBud(req.body.spoodawebId, clientObjId, transaction)
              const budId = bud.dataValues.id
              for (const definitionId of Object.keys(obj.definitions)) {
                if (obj.definitions[definitionId] === null) {
                  // console.log("budDetail", budId, definitionId)
                  await markBudDetailForDeletion(budId, definitionId, transaction)
                } else {
                  const examples = obj.definitions[definitionId]
                  for (const example of examples) {
                    await markExampleForDeletion(definitionId, example, transaction)
                  }
                }
              }
            }
            break
          case "edit":
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
      }
      await transaction.commit()
      next()
    } catch (err) {
      await transaction.rollback()
      next(err)
    }
  }
}