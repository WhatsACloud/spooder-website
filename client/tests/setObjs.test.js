import spoodawebData from "../src/components/Edit/TestingSpoodawebData"
let objs = [...spoodawebData]
const setLeObjs = (val) => objs = val
const setObjs = (val) => {
  const newObjs = [...objs]
  newObjs.push(val)
  setLeObjs(newObjs)
}
const testData = [...spoodawebData]
testData.push({position: {x: 1, y: 2}})

const secondTestData = [...testData]
secondTestData.push({position: {x: 1, y: 2}})

test('tests whether setObjs will work', () => {
  expect(objs).toEqual(spoodawebData)
  setObjs({position: {x: 1, y: 2}})
  expect(objs).toEqual(testData)
  setObjs({position: {x: 1, y: 2}})
  expect(objs).toEqual(secondTestData)
})