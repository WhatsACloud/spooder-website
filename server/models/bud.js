const { sequelize, DataTypes } = require('../database')
const Bud = require('../databaseModels/bud')(sequelize, DataTypes)
const BudDetails = require('../databaseModels/BudDetails/budDetails')(sequelize, DataTypes)
const Context = require('../databaseModels/BudDetails/contexts')(sequelize, DataTypes)
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
  const bud = await Bud.findOne({where: {id: budId}}, {transaction, transaction})
  if (bud === null) throw error.create(`bud either does not exist or has been deleted`, {statusNo: 400})
  if (bud.dataValues.deletedAt !== null) throw error.create(`bud either does not exist or has been deleted`, {statusNo: 400})
  await bud.update({"deletedAt": Date.now()}, {transaction: transaction})
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

async function createBud(spoodawebId, word, transaction) {
  const _bud = await Bud.create({
    fk_spoodaweb_id: spoodawebId,
    word: word
  }, {transaction: transaction})
  return _bud
}

async function createBudDetails(budId, definitionName, pronounciation, transaction) {
  const budDetails = await BudDetails.create({
    fk_bud_id: budId,
    definition: definitionName,
    pronounciation: pronounciation
  }, {transaction: transaction})
  return budDetails
}

async function createContext(budDetailsId, context, transaction) {
  const _context = await Context.create({
    fk_bud_details_id: budDetailsId,
    context: context
  }, {transaction: transaction})
  return _context
}

async function createExample(contextId, example, transaction) {
  await Example.create({
    fk_context_id: contextId,
    example: example
  }, {transaction: transaction})
}

module.exports = {
  async edit (req, res, next) {
    let transaction
    try {
      const userId = req.body.jwtTokenData.userId
      const data = req.body.spoodawebData
      transaction = await sequelize.transaction()
      for (const budName in data) {
        const bud = data[budName]
        if (bud.type === "add") {
          const _budId = await createBud(req.body.spoodawebId, budName, transaction)
          const budId = _budId.dataValues.id
          for (const definitionName in bud.data) {
            const definition = bud.data[definitionName]
            const _budDetailsId = await createBudDetails(budId, definitionName, definition.pronounciation, transaction)
            const budDetailsId = _budDetailsId.dataValues.id
            console.log(definition)
            for (let i = 0; i < definition.contexts.length; i++) {
              const context = definition.contexts[i]
              const _contextId = await createContext(budDetailsId, context, transaction)
              const contextId = _contextId.dataValues.id
              for (const exampleNo in definition.examples[i]) {
                const example = definition.examples[i][exampleNo]
                await createExample(contextId, example, transaction)
              }
            }
          }
        } else if (bud.type === "sub") {
          await markBudForDeletion(bud.data.id, transaction)
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