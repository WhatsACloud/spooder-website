import Api from './Api.js'

export default {
  register (credentials) {
    try {
      return Api().post('/register', credentials)
    } catch (err) {
      console.log(err)
      return err
    }
  },
  login (credentials) {
    try {
      return Api().post('/login', credentials)
    } catch (err) {
      console.log(err)
      return err
    }
  }
}