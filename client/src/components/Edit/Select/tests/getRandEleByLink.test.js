const objs = {
  1: { json: { link: 1, word: 'a' }, tsts: null },
  2: { json: { link: 1, word: 'a' }, tsts: null },
  3: { json: { link: 1, word: 'a' }, tsts: null },
  4: { json: { link: 1, word: 'a' }, tsts: null },
  5: { json: { link: 0, word: '' }, tsts: null },
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

const categs = [
  "word",
  "definition",
  "sound",
  "example",
]

const randomOfNum10 = (total) => {
  const val = Math.floor(Math.random() * total * 10) / 10
  return val
}

const amtFilledCategs = (obj) => {
  let included = []
  for (const categ of categs) {
    if (obj.json[categ]) included.push(categ)
  }
  return included
}

const getRandEleByLink = (objIds, ctt, categName=null) => { // ctt: current times tested
  let total = 0
  const _links = {}
  for (const objId of objIds) {
    const obj = utils.getObjById(objId)
    const leLink = 1 - obj.json.link
    const link = leLink === 0 ? 0.1 : leLink
    _links[objId] = link
  }
  const ceil = 5
  const leLinks = Object.entries(_links)
    .sort((a, b) => {
      return a[1] - b[1]
    })
  let links = leLinks.filter(([ objId ]) => {
      const obj = utils.getObjById(objId)
      const tsts = obj.tsts
      console.log(objId, obj)
      if (tsts === null) return true
      const diff = ctt - tsts
      if (diff > ceil) {
        obj.tsts = null
        return true
      }
      if (diff <= 2) return false
      const can = Math.random() < ceil / diff
      return can
    })
  for (const [ _, link ] of links) {
    console.log(link)
    total += link
  }
  console.log(links)
  if (links.length === 0) links = leLinks
  if (categName !== null) {
    let containsCateg = false
    for (let [ objId ] of links) {
      const obj = utils.getObjById(objId)
      if (amtFilledCategs(obj).includes(categName)) {
        containsCateg = true
        break
      }
    }
    if (!containsCateg) return false
  }
  let start = 0
  console.log('what', total)
  const num = randomOfNum10(total)
  for (let [ objId, link ] of links) {
    const obj = utils.getObjById(objId)
    const tst = obj.tsts
    if (ctt - tst > ceil) obj.tsts = null
    console.log(start, link + start, num)
    if (num >= start && num <= link + start) {
      obj.tsts = ctt
      return objId
    }
    start += link
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
  const iters = 100
  const results = []
  for (let i = 0; i < iters; i++) {
    const result = getRandEleByLink(indexArr, i)
    results.push(result)
    distribution[result-1]++
  }
  console.log(results)
  console.log(distribution)
  const spread = distribution.map(e => e / iters)
  console.log(spread)
  const supposedSpread = indexArr.map(e => utils.getObjById(e).json.link)
  const a = indexArr.map(e => utils.getObjById(e).json.word)
  console.log(a)
  console.log(supposedSpread)
})