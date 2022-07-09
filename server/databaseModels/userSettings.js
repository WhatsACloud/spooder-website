module.exports = (sequelize, DataTypes) => {
  const userSettings = sequelize.define(
    'UserSettings',
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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }
  )
  userSettings.associate = function (models) {
    userSettings.belongsTo(models.Users)
  }
  return User
}