module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    'Images',
    {
      fk_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }
  )
  Image.associate = function (models) {
    Image.belongsTo(models.Users)
  }
  return Image
}