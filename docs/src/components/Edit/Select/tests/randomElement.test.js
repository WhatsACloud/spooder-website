const randomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const array = [1, 2, 3, 4, 5]

test('Tests whether randomElement will retrieve a random element.', () => {
  for (let i = 0; i < 10; i++) {
    console.log(randomElement(array))
  }
})