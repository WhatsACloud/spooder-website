const defaultMsg = 'An error has occured in the server, please try again later'

/*
instead of server side msgs try error codes e.g. err42069,
and the client interprets that
and sends the displays the message accordingly e.g. you are not authorized
*/

module.exports = {
  customError (message, attributes) {
    let error = new Error(message)
    if (attributes !== undefined) {
      const keys = Object.keys(attributes)
      keys.forEach((key) => {
        error[key] = attributes[key]
      })
    }
    return error
  },
  create (message, attributes) {
    if (message === undefined) {
      message = defaultMsg
    }
    if (attributes && attributes.debug) {
      console.log(`debugging: ${attributes.debug}`)
      delete attributes.debug
    }
    let error = {message: message, type: true}
    if (attributes !== undefined) {
      const keys = Object.keys(attributes)
      keys.forEach((key) => {
        error[key] = attributes[key]
      })
    } else {
      error.type = 'serverErr'
    }
    return error
  },
  async errorHandler (error, req, res, next) {
    console.log(error)
    let response = {error: {message: defaultMsg, type: 'serverErr'}}
    if (error.message && error.type) response.error = error // requires message and type to override default error
    if (error.type) response.error.type = error.type
    response.type = false
    console.log(response)
    const statusNo = error.statusNo
    try {
      if (typeof statusNo === "number") {
        delete error.statusNo
        return res.status(statusNo).send(response) 
      } else throw new Error
    } catch (err) {
      res.status(500).send(response)
    }
  }
}

/*
Standard for errors

if error, type is false. If no error, type is true
if error, then there is an object inside called error, which is used to store data. All attributes referenced are now from this error object.
use type to denote the type of error, 'serverErr' is default error

different error types:

serverErr
tokenErr

use next( INSERT FUNCTION NAME ) to invoke default error

*/