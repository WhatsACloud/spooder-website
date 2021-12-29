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
          model: 'Users',
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
    Article.belongsTo(models.Users)
  }
  return Article
}