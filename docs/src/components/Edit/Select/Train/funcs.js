import * as utils from '../../utils'

// runs searchFunc on each nearby bud and returns number of true evaluations of searchFunc
// passes in budId to searchFunc
// maxBuds denotes when it stops
const search = (startBudId, searchFunc, maxBuds) => { // broken btw
  const toExplore = [startBudId]
  const explored = new Set()
  let count = searchFunc(startBudId) ? 1 : 0
  while (toExplore.length > 0 && count < maxBuds) {
    const current = toExplore.shift()
    const currentObj = utils.getObjById(current)
    for (const objId of currentObj.attachedTos) {
      if (!explored.has(objId) && !toExplore.includes(objId)) {
        toExplore.push(objId)
      }
      if (searchFunc(objId)) {
        count++
      }
    }
    explored.add(current)
  }
  return count
}

const searchAll = (searchFunc, maxBuds) => {
  let count = 0
  for (const objId of Object.keys(utils.getObjs())) {
    if (searchFunc(objId)) {
      count++
    }
    if (count >= maxBuds) break
  }
  return count
}

export const networkHasHowManyOfCateg = (min, categ, startBudId) => {
  const minimumCategSearchFunc = (objId) => {
    const bud = utils.getObjById(objId)
    console.log(bud.json[categ])
    return bud.json[categ] !== ''
  }
  // const count = search(startBudId, minimumCategSearchFunc, min)
  const count = searchAll(minimumCategSearchFunc, min)
  return count
}