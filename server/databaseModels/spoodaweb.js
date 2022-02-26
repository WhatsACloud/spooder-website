module.exports = (sequelize, DataTypes) => {
  const Spoodaweb = sequelize.define(
    'Spoodawebs',
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
  Spoodaweb.associate = function (models) {
    Spoodaweb.belongsTo(models.Users)
    Spoodaweb.hasMany(models.Bud, {foreignKey: DataTypes.UUID, onDelete: 'cascade'})
  }
  return Spoodaweb
}