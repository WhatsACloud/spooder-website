const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const loginService = require('../services/loginService')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

loginService(app)
  .catch(console.error)

app.listen(process.env.PORT || 8081)