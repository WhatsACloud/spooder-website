module.exports = (sequelize, DataTypes) => {
  const Bud = sequelize.define(
    'Bud',
    {
      fk_spoodaweb_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'Spoodawebs',
          key: 'id'
        }
      },
      word: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }
  )
  Bud.associate = (models) => {
    Bud.belongsTo(models.Spoodawebs)
    Bud.hasMany(models.BudDetails, {foreignKey: DataTypes.UUID})
  }
  return Bud
}
