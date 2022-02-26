const defaultMsg = 'An error has occured in the server, please try again later'

module.exports = {
  create (message, attributes) {
    if (message === undefined) {
      message = defaultMsg
    }
    let error = {message: message}
    if (attributes !== undefined) {
      const keys = Object.keys(attributes)
      keys.forEach((key) => {
        error[key] = attributes[key]
      })
    } else {
      error.type = true
    }
    return error
  },
  async errorHandler (error, req, res, next) {
    console.log(error)
    let response = {error: {message: defaultMsg}}
    response.error = error
    response.type = false
    console.log(response)
    res.status(500).send(response)
  }
}

/*
Standard for errors

if error, type is false. If no error, type is true
if error, then there is an object inside called error, which is used to store data. All attributes referenced are now from this error object.
use type to denote the type of error

*/