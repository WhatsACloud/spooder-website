module.exports = (sequelize, DataTypes) => {
  const Spoodaweb = sequelize.define(
    'Spoodaweb',
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
      title: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }
  )
  Spoodaweb.associate = (models) => {
    Spoodaweb.belongsTo(models.Users)
  }
  return Spoodaweb
}