const { sequelize, DataTypes } = require('../database')
const Bud = require('../databaseModels/bud')(sequelize, DataTypes)
const BudDetails = require('../databaseModels/BudDetails/budDetails')(sequelize, DataTypes)
const Context = require('../databaseModels/BudDetails/contexts')(sequelize, DataTypes)
const Example = require('../databaseModels/BudDetails/examples')(sequelize, DataTypes)

async function createBud(spoodawebId, word) {
  const _bud = await Bud.create({
    fk_spoodaweb_id: spoodawebId,
    word: word
  })
  return _bud
}

async function createBudDetails(budId, definitionName, pronounciation) {
  const budDetails = BudDetails.create({
    fk_bud_id: budId,
    definition: definitionName,
    pronounciation: pronounciation
  })
  return budDetails
}

async function createContext(budDetailsId, context) {
  const _context = Context.create({
    fk_bud_details_id: budDetailsId,
    context: context
  })
  return _context
}

async function createExample(contextId, example) {
  Example.create({
    fk_context_id: contextId,
    example: example
  })
}

module.exports = {
  async edit (req, res, next) {
    const userId = req.body.jwtTokenData.userId
    try {
      let data = req.body.spoodawebData
      for (const budName in data) { // note that this only applies to add operation. To add for sub
        const bud = data[budName]
        const _budId = await createBud(req.body.spoodawebId, budName)
        const budId = _budId.dataValues.id
        for (const definitionName in bud.data) {
          const definition = bud.data[definitionName]
          const _budDetailsId = await createBudDetails(budId, definitionName, definition.pronounciation)
          const budDetailsId = _budDetailsId.dataValues.id
          console.log(definition)
          for (let i = 0; i < definition.contexts.length; i++) {
            const context = definition.contexts[i]
            const _contextId = await createContext(budDetailsId, context)
            const contextId = _contextId.dataValues.id
            for (const exampleNo in definition.examples[i]) {
              const example = definition.examples[i][exampleNo]
              await createExample(contextId, example)
            }
          }
        } 
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}