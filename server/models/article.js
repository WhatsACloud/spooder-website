const User = require('./user')

module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    'Article',
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'User',
          key: 'id'
        }
      },
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
    Article.belongsTo(models.User)
  }
  return Article
}