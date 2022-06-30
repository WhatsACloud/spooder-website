const { sequelize, DataTypes, Op } = require('../../database')
const Category = require('../../databaseModels/categories')(sequelize, DataTypes)
const error = require('../../middleware/error')

module.exports.Category = Category

const getCategories = async (spoodawebId) => {
  try {
    const dbCategs = await Category.findAll({
      where: {
        fk_spoodaweb_id: spoodawebId,
        deletedAt: {[Op.not]: null},
      }
    })
    return dbCategs
  } catch(err) {
    console.log(err)
    throw error.create('User does not exist.')
  }
}
module.exports.getCategories = getCategories

const containsCategId = async (dbCategs, categId) => {
  for (const dbCateg of dbCategs) {
    if (dbCateg.dataValues.categId === Number(categId)) return true
  }
  return false
}

const getNextCategId = async (spoodawebId) => {
  let highestCategId = await Category.max("categId", { "where": {
    fk_spoodaweb_id: spoodawebId
  }})
  let categId = 1
  if (!(isNaN(highestCategId))) {
    categId = highestCategId + 1
  }
  return categId
}

const updateCategories = async (spoodawebId, categs, transaction) => {
  const newCategs = {}
  const dbCategs = await getCategories(spoodawebId)
  let nextCategId = await getNextCategId(spoodawebId)
  for (const [ categId, categ ] of Object.entries(categs)) {
    const contains = await containsCategId(dbCategs, categId)
    console.log(contains)
    let dbCateg
    if (!contains) {
      dbCateg = await Category.create({
        fk_spoodaweb_id: spoodawebId,
        categId: nextCategId,
        color: categ.color,
        name: categ.name,
      }, { transaction: transaction })
      nextCategId++
    } else {
      dbCateg = await Category.findOne({
        where: {
          categId: categId
        }
      })
      console.log(dbCateg)
      if (categ.del) {
        dbCateg.update({
          deletedAt: Date.now()
        }, { transaction: transaction })
      } else if (categ.restore) {
        dbCateg.update({
          deletedAt: null
        }, { transaction: transaction })
      } else {
        dbCateg.update({
          color: categ.color,
          name: categ.name,
        }, { transaction: transaction })
      }
    }
    newCategs[dbCateg.dataValues.categId] = {
      color: dbCateg.dataValues.color,
      name: dbCateg.dataValues.name,
      id: dbCateg.dataValues.id,
    }
  }
  for (const dbCateg of dbCategs) {
    newCategs[dbCateg.dataValues.categId] = {
      color: dbCateg.dataValues.color,
      name: dbCateg.dataValues.name,
      id: dbCateg.dataValues.id,
    }
  }
  return newCategs
}
module.exports.updateCategories = updateCategories