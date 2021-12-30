module.exports = (message, attributes) => {
  let error = new Error(message)
  const keys = Object.keys(attributes)
  keys.forEach((key) => {
    error[key] = attributes[key]
  })
  return error
}