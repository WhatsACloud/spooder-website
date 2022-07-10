const fs = require('fs/promises')
const { sequelize, DataTypes } = require('../database')
const Images = require('../databaseModels/images')(sequelize, DataTypes)
const error = require('../middleware/error')

const setImage = async (userId, name, type, transaction) => {
  const result = await Images.create({
    fk_user_id: userId,
    name: name,
    type: type
  }, { transaction: transaction })
  return result
}

const deleteFile = async (currentName) => {
  const path = `images/${currentName}`
  try {
    const stats = await fs.stat(path)
  } catch(err) {
    console.log(`WARNING: file ${path} does not exist.`)
    return
  }
  await fs.unlink(path)
}

const editImage = async (dbImg, name, transaction) => {
  const currentName = dbImg.dataValues.name
  await deleteFile(currentName)
  const result = await dbImg.update({
    name: name
  }, { transaction: transaction })
}

const getOfName = async (userId, name) => {
  if (!name) return false
  const entry = await Images.findOne({
    where: {
      fk_user_id: userId,
      name: name
    }
  })
  return entry
}

const save = async (req, res, next) => {
  const userId = req.body.jwtTokenData.userId
  const filename = req.file.filename
  const transaction = await sequelize.transaction()
  console.log('what', __dirname)
  let img
  try {
    img = await getOfName(userId, req.body.name)
    console.log(img)
    if (img) {
      await editImage(img, filename, transaction)
    } else {
      const result = await setImage(userId, filename, req.body.type, transaction)
    }
    await transaction.commit()
    next()
  } catch(err) {
    await transaction.rollback()
    if (!img) await deleteFile(filename)
    console.log(err)
    next(err)
  }
}
module.exports.save = save