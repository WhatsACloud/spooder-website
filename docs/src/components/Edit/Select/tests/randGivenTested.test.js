const objs = {
  1: { json: { link: 1, word: 'a', definition: 'hm' }, tst: 0 },
  2: { json: { link: 1, word: 'a', definition: '' }, tst: 0 },
  3: { json: { link: 1, word: 'a', definition: '' }, tst: 0 },
  4: { json: { link: 1, word: '', definition: '' }, tst: 0 },
  5: { json: { link: 1, word: '', definition: 'what' }, tst: 0 },
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

const randomIndexFrRange = (num) => {
  return Math.floor(Math.random() * num)
}

const randIndexFrArr = (arr) => {
  return arr[randomIndexFrRange(arr.length)]
}

const ifBudsHaveNcategs = (n, categ) => {
  console.log(n, categ)
  const objs = utils.getObjs()
  for (const obj of Object.values(objs)) {
    if (n <= 0) break
    if (obj.json[categ] && obj.json[categ].length > 0) n--
  }
  if (n === 0) return true
  console.log(n, categ)
  return false
}

const categs = [
  "word",
  "definition",
  "sound",
  "example",
]

const givenCategs = [
  "word",
  "definition",
  "sound",
]

const testedCategs = [
  "word",
  "definition",
  "sound",
  "example",
]

const amtFilledCategs = (obj) => {
  let included = []
  for (const categ of categs) {
    if (obj.json[categ]) included.push(categ)
  }
  return included
}

const randGivenTested = (obj) => {
  const categsFilled = amtFilledCategs(obj)
  const actualGivenCategs = givenCategs.filter(e => categsFilled.includes(e))
  if (actualGivenCategs.length < 1) return [ false, false ]
  const givenCateg = randIndexFrArr(actualGivenCategs)
  const actualTestedCategs = testedCategs
    .filter(e => categsFilled.includes(e)
      && e !== givenCateg
      && !(givenCateg !== 'word' && e === 'sound')
      && !(givenCateg === 'sound' && e !== 'word')
      && !(givenCateg === 'definition' && e === 'example')
    )
  if (actualTestedCategs.length < 1) return [ false, false ]
  let testedCateg = givenCateg
  const got = []
  while (testedCateg === givenCateg || !(ifBudsHaveNcategs(4, testedCateg))) {
    if (got.length === actualTestedCategs.length) return [ false, false ]
    testedCateg = randIndexFrArr(actualTestedCategs)
    if (!got.includes(testedCateg)) {
      got.push(testedCateg)
    }
  }
  return [ givenCateg, testedCateg ]
}

test('Tests whether randGivenTested works.', () => {
  const [ givenCateg, testedCateg ] = randGivenTested(objs[1])
  console.log(givenCateg, testedCateg)
  const count = 1000
  // for (let i = 0; i < count; i++) {
  //   const [ givenCateg, testedCateg ] = randGivenTested(objs[1])
  //   if (testedCateg === 'sound' && givenCateg !== 'word') {
  //     console.log('no')
  //   }
  //   if (givenCateg !== 'word' && testedCateg === 'sound') {
  //     console.log('no')
  //   }
  //   console.log(givenCateg, testedCateg)
  //   // expect(givenCateg === testedCateg).toBe(false)
  // }
})