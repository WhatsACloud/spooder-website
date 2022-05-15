const searchUtils = require('./searchUtils')

const SearchForString = (queryString, array) => {
  const result = []
  for (const [ index, element ] of array.entries()) {
    if (queryString === element) {
      result.push(index)
    }
  }
  return result
}

const addToFound = (foundBuds, foundBudsObjId, searchResults, buds) => {
  if (searchResults.length > 0) {
    for (const index of searchResults) {
      const objId = buds[index].dataValues.objId
      if (!(foundBudsObjId.includes(objId))) {
        foundBuds.push(buds[index])
        foundBudsObjId.push(objId)
      }
    }
  }
}

const parseArray = [
  searchUtils.getBudWords
]

const search = async (req, res, next) => {
  const spoodawebId = req.body.spoodawebId
  switch (req.body.queryType) {
    case "text":
      const rawQueryStrings = req.body.queryString.split(" ")
      const queryStrings = [... new Set(rawQueryStrings)]
      const allBuds = await searchUtils.getEntireBud(spoodawebId)
      const budWords = []
      const buds = []
      for (const [ objId, obj ] of Object.entries(allBuds)) {
        budWords.push(obj.bud.dataValues.word)
        buds.push(obj.bud)
      }
      const foundBuds = []
      const foundBudsObjId = []
      for (const queryString of queryStrings) {
        if (budWords.includes(queryString)) {
          const searchResults = SearchForString(queryString, budWords)
          addToFound(foundBuds, foundBudsObjId, searchResults, buds)
        }
      }
      console.log(foundBuds, foundBudsObjId)
      break
  }
  next()
}
module.exports.search = search