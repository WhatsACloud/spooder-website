const isObject = (val) => { return val.constructor === Object }

const compareObjects = (arr1, arr2) => {
  if (!(isObject(arr1)) || !(isObject(arr2))) return false
  if (arr1.length !== arr2.length) return false
  for (const key of Object.keys(arr1)) {
    if (arr1[key] !== arr2[key]) return false
  }
  return true
}

const obj1 = {"test": 5, "another": 1}
const obj2 = {"test2": 3}

const obj3 = {"test": 5, "another": 1}
const obj4 = {"test": 5, "another": 3}

const obj5 = {"test": 5, "another": 3}
const obj6 = {"test": 5, "another": 3}

const obj7 = 1
const obj8 = {"test": 5, "another": 3}

test('This checks if two objects are the same.', () => {
  expect(compareObjects(obj1, obj2)).toBe(false)
})

test('This checks if two objects are the same.', () => {
  expect(compareObjects(obj3, obj4)).toBe(false)
})

test('This checks if two objects are the same.', () => {
  expect(compareObjects(obj5, obj6)).toBe(true)
})

test('This checks if compareObjects returns false if a parameter is not an object.', () => {
  expect(compareObjects(obj7, obj8)).toBe(false)
})