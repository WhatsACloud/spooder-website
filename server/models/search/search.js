const searchUtils = require('./searchUtils')
const { search } = require('fast-fuzzy')

const SearchForString = (queryString, string) => {
  if (queryString === "") return false
  const fuzzy = search(queryString, [string]) 
  return fuzzy
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

const parse = (queryString, string, foundBuds, objId, bud, type) => {
  const result = SearchForString(queryString, string, bud)
  if (result.length) {
    addToFound(foundBuds, objId)
    bud.found = [type, result[0]]
  }
}

const Search = async (req, res, next) => {
  // console.log(req.body)
  // const spoodawebId = req.body.spoodawebId
  // switch (req.body.queryType) {
  //   case "text":
  //     const rawQueryStrings = req.body.queryString.split(" ")
  //     const queryStrings = [... new Set(rawQueryStrings)]
  //     const allBuds = await searchUtils.getEntireBud(spoodawebId)
  //     const foundBuds = []
  //     for (const queryString of queryStrings) {
  //       for (const [ objId, bud ] of Object.entries(allBuds)) {
  //         const budWord = bud.word
  //         parse(queryString, budWord, foundBuds, objId, bud, "word")
  //         for (const definition of bud.definitions) {
  //           for (const toParse of definitionsParse) {
  //             parse(queryString, definition[toParse], foundBuds, objId, bud, toParse)
  //           }
  //           for (const example of definition.examples) {
  //             parse(queryString, example, foundBuds, objId, bud, "examples")
  //           }
  //         }
  //       }
  //     }
  //     const buds = {}
  //     for (const foundBud of foundBuds) {
  //       buds[foundBud] = allBuds[foundBud]
  //       delete buds[foundBud].id
  //     }
  //     req.body.buds = buds
  //     break
  // }
  next()
}
module.exports.search = Search