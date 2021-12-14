const axios = require('axios').default

export default () => {
  return axios.create({
    baseURL: `http://localhost:8081/`
  })
}