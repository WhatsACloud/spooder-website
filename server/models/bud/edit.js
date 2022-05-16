const { sequelize, DataTypes, Op } = require('../../database')
const Bud = require('../../databaseModels/bud')(sequelize, DataTypes)
const Silk = require('../../databaseModels/Silk')(sequelize, DataTypes)
const BudDetails = require('../../databaseModels/BudDetails/budDetails')(sequelize, DataTypes)
const Example = require('../../databaseModels/BudDetails/examples')(sequelize, DataTypes)
const AttachedTo = require('../../databaseModels/BudDetails/AttachedTo')(sequelize, DataTypes)
const error = require('../../middleware/error')
const Utils = require('./Utils')

async function markForDeletion(objs, t) { // TO DO: add links thingy
  if (objs === null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  if (Array.isArray(objs)) {
    let idList = []
    for (objNo in objs) {
      const obj = objs[objNo]
      await obj.update({"deletedAt": Date.now()}, {transaction: t})
      idList.push(obj.dataValues.id)
    }
    return idList
  }
}

async function markBudForDeletion(budId, transaction) {
  const obj = await Bud.findOne({where: {id: budId}}, {transaction, transaction})
  if (obj === null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  if (obj.dataValues.deletedAt !== null) throw error.create(`obj either does not exist or has been deleted`, {statusNo: 400})
  await obj.update({"deletedAt": Date.now()}, {transaction: transaction})
  const budDetails = await BudDetails.findAll({where: {fk_bud_id: budId}}, {transaction: transaction})
  const budDetailsIdList = await markForDeletion(budDetails, transaction)
  for (const budDetailsNo in budDetailsIdList) {
    const budDetailsId = budDetailsIdList[budDetailsNo]
    const context = await Context.findAll({where: {fk_bud_details_id: budDetailsId}}, {transaction: transaction})
    console.log(context)
    const contextIdList = await markForDeletion(context, transaction)
    for (const contextIdNo in contextIdList) {
      const contextId = contextIdList[contextIdNo]
      const example = await Example.findAll({where: {fk_context_id: contextId}}, {transaction: transaction})
      await markForDeletion(example, transaction)
    }
  }
}


async function findBud(spoodawebId, objId) {
  console.log(objId, "kill me")
  const possibleDbBud = await Bud.findAll({
    where: {
      fk_spoodaweb_id: spoodawebId,
      objId: objId
    }
  })
  if (possibleDbBud === null) return false
  if (possibleDbBud.length > 0) {
    const dbBuds = [...possibleDbBud]
    console.log(dbBuds)
    dbBuds.shift()
    for (const dbBud of dbBuds) {
      dbBud.update({
        objId: await getNextObjId(spoodawebId)
      })
    }
    console.log(possibleDbBud)
    return possibleDbBud[0] 
  }
  return false
}

async function createBud(spoodawebId, word, objId, position, transaction) {
  const possibleDbBud = await findBud(spoodawebId, objId)
  console.log(possibleDbBud)
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
  for (_attachedTo of _attachedTos) {
    _attachedTo.destroy()
  }
  for (const attachedToId of Object.keys(attachedTo)) {
    const innerIndex = attachedTo[attachedToId]
    console.log(attachedToId, 'attachedToId')
    await createAttachedTo(attachedToId, innerIndex, budId, transaction)
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

async function createExample(budDetailsId, example, transaction) {
  await Example.create({
    fk_budDetails_id: budDetailsId,
    example: example
  }, {transaction: transaction})
}

async function editBud(spoodawebId, objId, word, position, transaction) {
  const possibleDbBud = await findBud(spoodawebId, objId)
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
    createBudDetails(budId, id, definition, sound, context, link, transaction)
    return
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
  if (examples === null || examples.length === 0) return null
  for (let index = 0; index < newExamples.length; index++) {
    const example = examples[index]
    const newExample = newExamples[index]
    if (example !== undefined) {
      await example.update({
        example: newExample
      }, {transaction: transaction})
    } else {
      await createExample(budDetailsId, newExample, transaction)
    }
  }
}

const addBud = async (spoodawebId, obj, objId, transaction) => {
  const _budId = await createBud(spoodawebId, obj.word, objId, obj.position, transaction)
  if (_budId === false) throw error.create(`object ${objId-1} (bud) already exists within database.`)
  objId += 1
  const budId = _budId.dataValues.id
  for (let i = 0; i < obj.definitions.length; i++) {
    const definition = obj.definitions[i]
    const _budDetailsId = await createBudDetails(budId, i, definition.definition, definition.sound, definition.context, definition.link, transaction)
    const budDetailsId = _budDetailsId.dataValues.id
    const examples = definition.examples
    for (const example of examples) {
      await createExample(budDetailsId, example, transaction)
    }
  }
  let i = 0
  for (const attachedToId of Object.keys(obj.attachedTo)) {
    const innerIndex = obj.attachedTo[attachedToId]
    await createAttachedTo(attachedToId, i, budId, transaction)
    i++
  }
}

const completeEditBud = async (spoodawebId, clientObjId, objId, obj, transaction) => {
  console.log("why are you doing this", obj)
  const bud = await editBud(spoodawebId, clientObjId, obj.word, obj.position, transaction)
  if (bud === false) {
    console.log('whyyylkdsdfksadfkslfkjelfjf')
    return false
  }
  console.log(bud)
  const budId = bud.dataValues.id
  console.log(obj.definitions)
  for (const i in obj.definitions) {
    const definition = obj.definitions[i]
    const _budDetailsId = await editBudDetails(budId, i, definition.definition, definition.sound, definition.link, definition.context, transaction)
    if (_budDetailsId === null) throw error.create('details does not exist')
    console.log(definition)
    await editExamples(_budDetailsId.dataValues.id, definition.examples, transaction)
  }
  console.log(obj.attachedTo, 'attachedTo')
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
      for (const clientObjId in data) {
        const obj = data[clientObjId]
        switch (obj.operation) {
          case "sub":
            await markBudForDeletion(clientObjId, transaction)
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