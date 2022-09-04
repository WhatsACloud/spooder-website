const randomIndexFrRange = (num, exclude=[]) => {
  while (true) {
    const no = Math.floor(Math.random() * num)
    if (exclude.includes(no)) continue
    return no
  }
}

const randIndexFrArr = (arr) => {
  return arr[randomIndexFrRange(arr.length)]
}

const range = (start, stop, step=1) => 
  Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step))

const randRGB = (min=0, max=255) => {
  const rgb = []
  for (let i = 0; i < 3; i++) {
    rgb.push(randIndexFrArr(range(min, max)))
  }
  return rgb
}

test('Test whether randRGB works.', () => {
  const count = 1000
  const min = 200
  const max = 220
  for (let i = 0; i < count; i++) {
    const rgb = randRGB(min, max)
    for (const color of rgb){
      expect(min <= color).toBe(true)
      expect(max >= color).toBe(true)
    }
  }
})