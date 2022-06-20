const utils = {
  getObjs: () => {
    return {
      1: { json: {word: '1'} },
      2: { json: {word: '2'} },
      3: { json: {word: '3'} },
      4: { json: {word: '4'} },
      5: { json: {word: ''} },
      6: { json: {word: ''} },
      7: { json: {word: ''} },
      8: { json: {word: ''} },
      9: { json: {word: '5'} },
      10: { json: {word: '6'} },
      11: { json: {word: '7'} },
    }
  }
}

const randomIndexFrRange = (num, exclude=[]) => {
  while (true) {
    const no = Math.floor(Math.random() * num)
    if (exclude.includes(no)) continue
    return no
  }
}

const getNotEmptyOfCateg = (categName) => {
  const objs = Object.values(utils.getObjs()).filter(obj => String(obj.json[categName]).length > 0)
  return objs
}

const getRandomOfCateg = (categName, no, exclude=[]) => {
  exclude = exclude.map(e => String(e))
  const arr = []
  const excludedArr = []
  const objs = getNotEmptyOfCateg(categName).filter(obj => !(exclude.includes(obj.json[categName])))
  if (no > objs.length) no = objs.length
  for (let i = 0; i < exclude.length; i++) {
    const randomElement = randomIndexFrRange(no, excludedArr)
    // console.log(randomElement)
    excludedArr.push(randomElement)
  }
  for (let i = 0; i < no; i++) {
    if (excludedArr.includes(i)) {
      arr.push(null)
      continue
    }
    const index = randomIndexFrRange(objs.length)
    let val = objs[index].json[categName]
    objs.splice(index, 1)
    arr.push(val)
  }
  return [ arr, excludedArr ]
}

test('Tests whether getRandomOfCateg will retrieve the specified number of values from that category.', () => {
  // const [ result1 ] = getRandomOfCateg('word', 3)
  // // console.log(result1)
  // const [ result2 ] = getRandomOfCateg('word', 10)
  // // console.log(result2)
  // const [ result3 ] = getRandomOfCateg('word', 5)
  // // console.log(result3)
  // const [ result4, excluded1 ] = getRandomOfCateg('word', 5, ["1", "2"])
  // // console.log(result4, excluded1)
  // expect(excluded1.length).toBe(2)
  // for (const x of excluded1) {
  //   expect(result4[x]).toBe(null)
  // }
  // const [ result5, excluded2 ] = getRandomOfCateg('word', 5, [1, 2])
  // // console.log(result5, excluded2)
  // expect(excluded2.length).toBe(2)
  // for (const x of excluded2) {
  //   expect(result5[x]).toBe(null)
  // }
  const count = 1000
  for (let i = 0; i < count; i++){
    const [ result, exclude ] = getRandomOfCateg('word', 5, [1, 2])
    expect([...new Set(exclude)].length === 2).toBe(true)
  }
})