const { sequelize, DataTypes, Op } = require('../database')
const Bud = require('../databaseModels/bud')(sequelize, DataTypes)
const BudDetails = require('../databaseModels/BudDetails/budDetails')(sequelize, DataTypes)
const Example = require('../databaseModels/BudDetails/examples')(sequelize, DataTypes)
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
    objId: objId
  }, {transaction: transaction})
  return _bud
}

async function createBudDetails(budId, definition, sound, context, transaction) {
  console.log(budId, definition, sound, context)
  const budDetails = await BudDetails.create({
    fk_bud_id: budId,
    definition: definition,
    sound: sound,
    context: context
  }, {transaction: transaction})
  console.log(budDetails)
  return budDetails
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

async function getObjsWithinRange(startPos, endPos) {
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
      }
    }
  }) 
  return objs
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
    const toResObjs = {}
    const startPos = req.body.startPos
    const endPos = req.body.endPos
    const dbObjs = await getObjsWithinRange(startPos, endPos)
    for (const dbObj of dbObjs) {
      const objData = dbObj.dataValues
      const objId = objData.objId
      toResObjs[objId] = {
        word: objData.word,
        position: {
          x: objData.x,
          y: objData.y
        },
        sounds: [],
        contexts: [],
        definitions: [],
        examples: []
      }
      const budDetails = await getBudDetails(objData.id)
      for (const budDetail of budDetails) {
        const budDetailData = budDetail.dataValues
        const budDetailId = budDetailData.id
        toResObjs[objId].sounds.push(budDetailData.sound)
        toResObjs[objId].definitions.push(budDetailData.definition)
        toResObjs[objId].contexts.push(budDetailData.context)
        const examplesObj = []
        const examples = await getExamples(budDetailId)
        for (const example of examples) {
          examplesObj.push(example.dataValues.example)
        }
        toResObjs[objId].examples.push(examplesObj)
      }
    }
    req.body.spoodawebData = toResObjs
    next()
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
        if (obj.operation === "add") {
          const _budId = await createBud(req.body.spoodawebId, obj.name, objId, obj.position, transaction)
          objId += 1
          const budId = _budId.dataValues.id
          for (let i = 0; i < obj.definitions.length; i++) {
            const definition = obj.definitions[i]
            const _budDetailsId = await createBudDetails(budId, definition, obj.sounds[i], obj.contexts[i], transaction)
            const budDetailsId = _budDetailsId.dataValues.id
            const examples = obj.examples[i]
            for (const example of examples) {
              console.log("example", example)
              await createExample(budDetailsId, example, transaction)
            }
          }
        } else if (obj.operation === "sub") {
          await markBudForDeletion(objId, transaction)
        } else if (obj.operation === "edit") {
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

/*

"0": {
  "word": "毛泽东",
  "position": {
      "x": 80,
      "y": 70
  },
  "sounds": [
      "pronounciation test",
      "asdf"
  ],
  "contexts": [
      "this is a context for testing",
      "this is the second context"
  ],
  "definitions": [
      "some guy",
      "testing"
  ],
  "examples": [
      [
          "does this link up with the context???",
          "does this too?"
      ],
      [
          "this should go to the second context"
      ]
  ]
}

"1": {
  "name": "毛泽东",
  "sounds": [
      "pronounciation test",
      "asdf"
  ],
  "contexts": [
      "this is a context for testing",
      "this is the second context"
  ],
  "definitions": [
      "some guy",
      "testing"
  ],
  "examples": [
      [
          "does this link up with the context???",
          "does this too?"
      ],
      [
          "this should go to the second context"
      ]
  ],
  "links": {
      "1": 0.1,
      "2": 1,
      "3": 0.65
  },
  "position": {
  "x": 80,
  "y": 70
  },
  "type": "bud",
  "operation": "add"
  }
}

*/