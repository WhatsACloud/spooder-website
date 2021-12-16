const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const routes = require('../routes/route')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

for (const [key, value] of Object.entries(routes)) {
  value(app)
}

app.listen(process.env.PORT || 8081)