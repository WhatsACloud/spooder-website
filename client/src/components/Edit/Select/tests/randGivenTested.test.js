const randomIndexFrRange = (num) => {
  return Math.floor(Math.random() * num)
}

const randIndexFrArr = (arr) => {
  return arr[randomIndexFrRange(arr.length)]
}

const categs = [
  "word",
  "definition",
  "sound",
  "example",
]

const randGivenTested = () => {
    const givenCateg = randIndexFrArr(categs)
    let testedCateg = givenCateg
    while (testedCateg === givenCateg) {
      testedCateg = randIndexFrArr(categs)
    }
    return [ givenCateg, testedCateg ]
}

test('Tests whether randGivenTested works.', () => {
  // const { givenCateg, testedCateg } = randGivenTested()
  const count = 1000
  for (let i = 0; i < count; i++) {
    const [ givenCateg, testedCateg ] = randGivenTested()
    expect(givenCateg === testedCateg).toBe(false)
  }
})