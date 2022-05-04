const canvasWidth = 1200 
const canvasHeight = 700

const canvasBorderWidth = canvasWidth / 5
const canvasBorderHeight = canvasHeight / 5

const mockFunc = (txt) => {
  return (input) => {
    console.log(txt, input)
  }
} 

test('tests if it works', () => {
  expect(expandCanvas(
  {x: 5, y: -705},
  {x: canvasWidth / 2, y: canvasHeight / 2},
  canvasWidth,
  canvasHeight,
  mockFunc('setCanvasWidth'),
  mockFunc('setCanvasHeight')
  )).toBe(true)
})