const searchUtils = require('./searchUtils')
const { search } = require('fast-fuzzy')

const SearchForString = (queryString, string) => {
  if (queryString === "") return false
  const equal = queryString === string
  const fuzzy = search(queryString, [string]) 
  result = equal || fuzzy.length
  return result
}

const addToFound = ((foundBuds, objId) => {
  if (!(foundBuds.includes(objId))) {
    foundBuds.push(objId)
  }
})

const definitionsParse = [
  "definition",
  "sound",
  "context"
]

const Search = async (req, res, next) => {
  const spoodawebId = req.body.spoodawebId
  switch (req.body.queryType) {
    case "text":
      const rawQueryStrings = req.body.queryString.split(" ")
      const queryStrings = [... new Set(rawQueryStrings)]
      const allBuds = await searchUtils.getEntireBud(spoodawebId)
      const foundBuds = []
      for (const queryString of queryStrings) {
        for (const [ objId, bud ] of Object.entries(allBuds)) {
          const budWord = bud.word
          const result = SearchForString(queryString, budWord)
          if (result) addToFound(foundBuds, objId)
          for (const definition of bud.definitions) {
            for (const toParse of definitionsParse) {
              const result = SearchForString(queryString, definition[toParse])
              if (result) addToFound(foundBuds, objId)
            }
            for (const example of definition.examples) {
              const result = SearchForString(queryString, example)
              if (result) addToFound(foundBuds, objId)
            }
          }
        }
      }
      const buds = []
      for (const foundBud of foundBuds) {
        buds.push(allBuds[foundBud])
      }
      req.body.buds = buds
      break
  }
  next()
}
module.exports.search = Search