const { sequelize, DataTypes } = require('../database')
const Bud = require('../databaseModels/bud')(sequelize, DataTypes)
const BudDetails = require('../databaseModels/BudDetails/budDetails')(sequelize, DataTypes)
const Context = require('../databaseModels/BudDetails/contexts')(sequelize, DataTypes)
const Example = require('../databaseModels/BudDetails/examples')(sequelize, DataTypes)

async function markBudForDeletion(budId, transaction) {
  const bud = await Bud.findOne({
    where: {id: budId}
  }, {transaction: transaction})
  console.log('adklfdklasf')
  if (bud === null) throw new Error
  await bud.update({"deleted_at": Date.now()}, {transaction: transaction})
  await bud.save({transaction: transaction})
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
      for (const budName in data) { // note that this only applies to add operation. To add for sub
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
                console.log("a", example)
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

/*

for (const budName in data) { // note that this only applies to add operation. To add for sub
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
    deleteBud(bud.data.id)
  }
}
)

*/