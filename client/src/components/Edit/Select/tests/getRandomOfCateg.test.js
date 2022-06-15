const utils = {
  getObjs: () => {
    return {
      1: { json: {word: '1'} },
      2: { json: {word: '2'} },
      3: { json: {word: '3'} },
      4: { json: {word: '4'} },
      5: { json: {word: ''} },
    }
  }
}

const randomIndex = (arr) => {
  return Math.floor(Math.random() * arr.length)
}

const getRandomOfCateg = (categName, no, exclude=[]) => {
  exclude = exclude.map(e => String(e))
  const arr = []
  const excludedArr = []
  const objs = Object.values(utils.getObjs())
  if (no > objs.length) no = objs.length
  for (let i = 0; i < no; i++) {
    const index = randomIndex(objs)
    let val = objs[index].json[categName]
    objs.splice(index, 1)
    if (val.constructor === String && val.length === 0) continue
    if (exclude.includes(val)) {
      val = null
      excludedArr.push(arr.length)
    }
    arr.push(val)
  }
  return [ arr, excludedArr ]
}

test('Tests whether getRandomOfCateg will retrieve the specified number of values from that category.', () => {
  const [ result1 ] = getRandomOfCateg('word', 3)
  console.log(result1)
  const [ result2 ] = getRandomOfCateg('word', 10)
  console.log(result2)
  const [ result3 ] = getRandomOfCateg('word', 5)
  console.log(result3)
  const [ result4, excluded1 ] = getRandomOfCateg('word', 5, ["1", "2"])
  console.log(result4, excluded1)
  expect(excluded1.length).toBe(2)
  for (const x of excluded1) {
    expect(result4[x]).toBe(null)
  }
  const [ result5, excluded2 ] = getRandomOfCateg('word', 5, [1, 2])
  console.log(result5, excluded2)
  expect(excluded2.length).toBe(2)
  for (const x of excluded2) {
    expect(result5[x]).toBe(null)
  }
})