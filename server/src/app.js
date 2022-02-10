const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

require('../routes').addApiRoutes(app)
require('../database')

app.listen(process.env.PORT || 8081)