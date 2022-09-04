import { setBud } from "../src/components/Edit/HelperFuncs"

test('sets bud or smth', () => {
  expect(setBud({
    position: {x: 1, y: 2}
  })).toEqual({
    "pronounciation": "",
    "contexts": [],
    "examples": [],
    "links": {},
    "position": {x: 1, y: 2},
    "type": ""
  })
})