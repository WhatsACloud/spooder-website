const objs = {
  1: { json: { link: 0.2, word: 'a' }, tst: 0 },
  2: { json: { link: 0, word: 'a' }, tst: 0 },
  3: { json: { link: 0, word: 'a' }, tst: 0 },
  4: { json: { link: 0.9, word: 'a' }, tst: 0 },
  5: { json: { link: 0, word: '' }, tst: 0 },
  6: { json: { link: 0 }, tst: 0 },
  7: { json: { link: 0 }, tst: 0 },
  8: { json: { link: 0 }, tst: 0 },
  9: { json: { link: 0 }, tst: 0 },
  10: { json: { link: 0 }, tst: 0 },
  11: { json: { link: 0 }, tst: 0 },
}

const utils = {
  getObjs: () => {
    return objs
  },
  getObjById: (id) => {
    return utils.getObjs()[id]
  }
}

const randomOfNum10 = (total) => {
  const val = Math.floor(Math.random() * total * 10) / 10
  return val
}

const getRandEleByLink = (objIds, ctt, categName=null) => { // ctt: current times tested
  let total = 0
  const _links = {}
  for (const objId of objIds) {
    const obj = utils.getObjById(objId)
    const link = 1 - obj.json.link
    total += link
    _links[objId] = link
  }
  const links = Object.entries(_links)
    .sort((a, b) => {
      return a[1] - b[1]
    })
  if (total / objIds.length < 0.3) total = 5
  while (true) {
    for (let [ objId, link ] of links) {
      let num = randomOfNum10(total)
      const obj = utils.getObjById(objId)
      const tst = obj.tst
      const ceil = 2
      if (ctt - tst > ceil) obj.tst = 0
      if (tst > 0 && ctt - tst < ceil) num += ctt - tst
      if (link === 0) link = 0.1
      if (link > num) {
        if (categName !== null && String(obj.json[categName]).length === 0) continue
        obj.tst = ctt
        return objId
      }
    }
  }
}

const indexArr = [1, 2, 3, 4, 5]

// test('Tests whether randomOfNum10 works.', () => {
//   const result1 = randomOfNum10(3)
//   console.log(result1)
//   const result2 = randomOfNum10(5.6)
//   console.log(result2)
//   const result3 = randomOfNum10(1.23419)
//   console.log(result3)
// })

test('Tests whether getRandEleByLink works.', () => {
  const distribution = [0, 0, 0, 0, 0]
  const iters = 1000
  for (let i = 0; i < iters; i++) {
    const result = getRandEleByLink(indexArr, i, "word")
    distribution[result-1]++
  }
  console.log(distribution)
  const spread = distribution.map(e => e / iters)
  console.log(spread)
  const supposedSpread = indexArr.map(e => utils.getObjById(e).json.link)
  const a = indexArr.map(e => utils.getObjById(e).json.word)
  console.log(a)
  console.log(supposedSpread)
  expect(spread[4]).toBe(0)
})