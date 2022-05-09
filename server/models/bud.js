const { sequelize, DataTypes, Op } = require('../database')
const User = require('../databaseModels/user')(sequelize, DataTypes)
const Spoodaweb = require('../databaseModels/spoodaweb')(sequelize, DataTypes)
const Bud = require('../databaseModels/bud')(sequelize, DataTypes)
const Silk = require('../databaseModels/Silk')(sequelize, DataTypes)
const BudDetails = require('../databaseModels/BudDetails/budDetails')(sequelize, DataTypes)
const Example = require('../databaseModels/BudDetails/examples')(sequelize, DataTypes)
const AttachedTo = require('../databaseModels/BudDetails/AttachedTo')(sequelize, DataTypes)
const error = require('../middleware/error')

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

async function getNextObjId(spoodawebId) {
  let objId = await Bud.max("objId", { "where": {
    fk_spoodaweb_id: spoodawebId
  }})
  if (objId === null) {
    objId = 0
  } else {
    objId += 1
  }
  return objId
}

async function createBud(spoodawebId, word, objId, position, transaction) {
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

async function createAttachedTo(attachedToId, attachedTo, fk_bud_id, transaction) {
  await AttachedTo.create({
    attachedToId: attachedToId,
    attachedTo: attachedTo,
    fk_bud_id: fk_bud_id
  }, {transaction: transaction})
}

async function createBudDetails(budId, definition, sound, context, link, transaction) {
  const budDetails = await BudDetails.create({
    fk_bud_id: budId,
    definition: definition,
    sound: sound,
    link: link,
    context: context
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

async function createExample(budDetailsId, example, transaction) {
  await Example.create({
    fk_budDetails_id: budDetailsId,
    example: example
  }, {transaction: transaction})
}

async function editBud(spoodawebId, objId, word, transaction) {
  const bud = await Bud.findOne({ where: { fk_spoodaweb_id: spoodawebId, objId: objId }})
  if (bud === null) return null 
  await bud.update({
    word: word
  }, {transaction: transaction})
  return bud 
}

async function editBudDetails(budId, definitionName, pronounciation, transaction) {
  const budDetails = await BudDetails.findOne({ where: { fk_bud_id: budId }})
  if (budDetails === null) return null 
  budDetails.update({
    fk_bud_id: budId,
    definition: definitionName,
    pronounciation: pronounciation
  }, {transaction: transaction})
  return budDetails
}

async function editContext(budDetailsId, context, transaction) {
  const _context = await Context.findOne({ where : { fk_bud_details_id: budDetailsId }})
  if (_context === null) return null
  _context.update({
    context: context
  }, {transaction: transaction})
  return _context 
}

async function editExample(contextId, example, transaction) {
  const _example = await Example.findOne({ where: { fk_context_id: contextId }})
  if (_example === null) return null
  await _example.update({
    example: example
  }, {transaction: transaction})
}

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

async function editExample(contextId, example, transaction) {
  const _example = await Example.findOne({ where: { fk_context_id: contextId }})
  if (_example === null) return null
  await _example.update({
    example: example
  }, {transaction: transaction})
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

module.exports = { // please add support for positions, budId
  async get (req, res, next) {
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
          attachedTo: {}, 
          type: "bud"
        }
        const budDetails = await getBudDetails(objData.id)
        let i = 0
        for (const budDetail of budDetails) {
          const budDetailData = budDetail.dataValues
          const budDetailId = budDetailData.id
          console.log(toResObjs[objId])
          toResObjs[objId].definitions.push({
            sound: null,
            definition: null,
            context: null,
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
          toResObjs[objId].attachedTo[attachedToData.attachedToId] = attachedToData.attachedTo
        }
      }
      const dbSilkObjs = await getSilksWithinRange(spoodawebId, startPos, endPos)
      console.log(dbSilkObjs)
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
      next()
    } catch (err) {
      console.log('get spoodawebs err', err)
      next(err)
    }
  },
  async edit (req, res, next) {
    let transaction
    try {
      const userId = req.body.jwtTokenData.userId
      const data = req.body.spoodawebData
      const spoodawebId = req.body.spoodawebId
      transaction = await sequelize.transaction()
      let objId = await getNextObjId(spoodawebId)
      for (const clientObjId in data) {
        const obj = data[clientObjId]
        switch (obj.operation) {
          case "add":
            switch (obj.type) {
              case "bud":
                const _budId = await createBud(req.body.spoodawebId, obj.name, objId, obj.position, transaction)
                objId += 1
                const budId = _budId.dataValues.id
                for (let i = 0; i < obj.definitions.length; i++) {
                  const definition = obj.definitions[i]
                  const _budDetailsId = await createBudDetails(budId, definition.definition, definition.sound, definition.context, definition.link, transaction)
                  const budDetailsId = _budDetailsId.dataValues.id
                  const examples = definition.examples
                  for (const example of examples) {
                    await createExample(budDetailsId, example, transaction)
                  }
                }
                let i = 0
                for (const [ attachedToId, attachedTo ] of Object.entries(obj.attachedTo)) {
                  await createAttachedTo(attachedToId, attachedTo, budId, transaction)
                  i++
                }
                break
              case "silk":
                const silk = await createSilk(spoodawebId, obj.positions, obj.strength, objId, obj.attachedTo1, obj.attachedTo2, transaction) 
                objId++
            }
            break
          case "sub":
            await markBudForDeletion(objId, transaction)
          case "edit":
            objId = clientObjId
            const bud = await editBud(spoodawebId, objId, obj.name, transaction)
            if (bud === null) throw error.create('bud does not exist')
            const budId = bud.dataValues.id
            // console.log(obj)
            for (const definitionName of Object.keys(obj)) {
              const definition = obj[definitionName]
              // console.log(definition, definitionName)
              const _budDetailsId = await editBudDetails(budId, definitionName, definition.pronounciation, transaction)
              if (_budDetailsId === null) throw error.create('details does not exist')
              const budDetailsId = _budDetailsId.dataValues.id
              for (let i = 0; i < definition.contexts.length; i++) {
                const context = definition.contexts[i]
                const _contextId = await editContext(budDetailsId, context, transaction)
                if (context === null) throw error.create('context does not exist')
                const contextId = _contextId.dataValues.id
                for (const exampleNo in definition.examples[i]) {
                  const example = definition.examples[i][exampleNo]
                  await editExample(contextId, example, transaction)
                  if (example === null) throw error.create('example does not exist')
                }
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