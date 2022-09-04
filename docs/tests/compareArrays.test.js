const isArray = (val) => { return val.constructor === Array }

const compareArrays = (arr1, arr2) => {
  if (!(isArray(arr1)) || !(isArray(arr2))) return false
  if (arr1.length !== arr2.length) return false
  for (const e of arr1) {
    if (!(arr2.includes(e))) return false
  }
  return true
}

const arr1 = [2, 1, 3]
const arr2 = [1, 2]

const arr3 = 1
const arr4 = [1, 2]

test('This checks for equality in an array.', () => {
  expect(compareArrays(arr1, arr2)).toBe(false)
})

test('This checks if compareArrays returns false if a parameter is not an array.', () => {
  expect(compareArrays(arr3, arr4)).toBe(false)
})