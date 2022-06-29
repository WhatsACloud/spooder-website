const inRange = (start, end, num) => {
  const within1 = start <= num && end >= num
  const within2 = end <= num && start >= num
  return within1 || within2
}

const linesIntersect = (line1, line2) => {
  const slope1 = (line1[0].y - line1[1].y) / (line1[0].x - line1[1].x)
  const c1 = line1[0].y - (slope1 * line1[0].x)
  const slope2 = (line2[0].y - line2[1].y) / (line2[0].x - line2[1].x)
  const c2 = line2[0].y - (slope2 * line2[0].x)
  // 0 = slope1 * x + c1 - y
  // 0 = slope2 * x + c2 - y
  // (slope1 * x) + c1 = (slope2 * x) + c2
  // (slope1 - slope2) * x =  c2 - c1
  const x = (c2 - c1) / (slope1 - slope2)
  const y = slope1 * x + c1
  console.log(line1, x, y)

  const within1x = inRange(line1[0].x, line1[1].x, x)
  const within2x = inRange(line2[0].x, line2[1].x, x)

  const within1y = inRange(line1[0].y, line1[1].y, y)
  const within2y = inRange(line2[0].y, line2[1].y, y)
  console.log(within1x, within1y, within2x, within2y)
  return within1x && within2x && within1y && within2y
}

test('test', () => {
  // const line1 = [{x: 15, y: 9}, {x: 10, y: 0}]
  // const line2 = [{x: 10, y: 5}, {x: 20, y: 3}]

  // const intersects1 = linesIntersect(line1, line2)
  // expect(intersects1).toBe(true)

  // const line3 = [{x: 15, y: 9}, {x: 10, y: 0}]
  // const line4 = [{x: 25, y: 9}, {x: 20, y: 0}]
  // const intersects2 = linesIntersect(line3, line4)
  // expect(intersects2).toBe(false)
 
  const line5 = [{x: 323.1, y: 173.6}, {x: 459.1, y: 173.6}]
  const line6 = [{x: 365.1224976290174, y: 20.35874566047835}, {x: 525.1682788159369, y: 174.17499614233907}]
  const intersects3 = linesIntersect(line5, line6)
  expect(intersects3).toBe(false)
})