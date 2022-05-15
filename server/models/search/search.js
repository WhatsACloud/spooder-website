const searchUtils = require('./searchUtils')

const equalitySearch = (queryString, array) => {
  const result = array 
    .map((element, index) => element === queryString ? index : null)
    .filter(index => index !== null)
  return result
}

const search = async (req, res, next) => {
  const spoodawebId = req.body.spoodawebId
  switch (req.body.queryType) {
    case "text":
      const rawQueryStrings = req.body.queryString.split(" ")
      const queryStrings = [... new Set(rawQueryStrings)]
      const allBuds = await searchUtils.getEntireBud(spoodawebId)
      const budWords = allBuds.map(obj => obj.bud.dataValues.word)
      const foundBuds = []
      const foundBudsObjId = []
      for (const queryString of queryStrings) {
        if (budWords.includes(queryString)) {
          const searchResults = equalitySearch(queryString, budWords)
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
      }
      break
  }
  next()
}
module.exports.search = search