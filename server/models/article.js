const User = require('./user')

module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    'Article',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }
  )
  Article.associate = (models) => {
    // associations can be defined here
    console.log(models)
    this.belongsTo(User, {as: 'user'})
  }
  return Article
}