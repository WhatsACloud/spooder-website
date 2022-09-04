const isArray = (val) => { return val.constructor === Array }
const isObject = (val) => { return val.constructor === Object }

const compare = (var1, var2, func=null) => { // checks if is object or array, and does things accordingly
  if (isObject(var1) && isObject(var2)) {
    if (!(compareObjects(var1, var2))) return false
  } else if (isArray(var1) && isArray(var2)) {
    if (!(compareArrays(var1, var2))) return false
  } else {
    return func ? func() : true
  }
  return true
}

const compareArrays = (arr1, arr2) => {
  if (!(isArray(arr1)) || !(isArray(arr2))) return false
  if (arr1.length !== arr2.length) return false
  for (const e of arr1) {
    if (!(arr2.includes(e))) return false
  }
  return true
}

const compareObjects = (arr1, arr2) => {
  if (!(isObject(arr1)) || !(isObject(arr2))) return false
  if (arr1.length !== arr2.length) return false
  for (const key of Object.keys(arr1)) {
    const same = compare(arr1[key], arr2[key], () => {
      if (arr1[key] !== arr2[key]) return false
      return true
    })
    if (!same) return false
  }
  return true
}

const obj1 = {"test": 1}
const obj2 = {"test": 2, "lol": "what"}

// test('Compares two objects', () => {
//   expect(compareObjects(obj1, obj2)).toBe(false)
// })

const obj3 = {"test": 2, "lol": {...obj1}}
const obj4 = {"test": 2, "lol": {...obj2}}

// test('Compares two objects', () => {
//   expect(compareObjects(obj3, obj4)).toBe(false)
// })

const arr1 = [1, [1, 2]]
const arr2 = [1, [1, 2]]

test('Compares two arrays', () => {
  expect(compareObjects(arr1, arr2)).toBe(false) // will not work for now bcuz no need this feature
})