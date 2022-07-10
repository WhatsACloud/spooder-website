const path = require('path')
const fs = require('fs/promises')
const error = require('../middleware/error')

const del = (req, res, next) => {

}
module.exports.delete = del

const getEnd = async (req, res, next) => {
  const filename = path.resolve(`${__dirname}/../images/${req.body.name}`)
  console.log(filename)
  try {
    const fileBuffer = await fs.readFile(filename)
    // const base64 = fileBuffer.toString('base64')
    // res.send({ data: base64 })
    res.sendFile(filename)
  } catch(err) {
    console.log(err)
    next(err)
  }
}
module.exports.getEnd = getEnd

const getBackgroundEnd = async (req, res, next) => {

}

const setEnd = (req, res, next) => {
  res.send({ type: true, filename: req.file.filename })
}
module.exports.setEnd = setEnd