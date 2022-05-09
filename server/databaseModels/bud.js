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
        allowNull: false
      },
      x: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      y: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      objId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }
  )
  Bud.associate = (models) => {
    Bud.belongsTo(models.Spoodawebs)
    Bud.hasMany(models.BudDetails, {foreignKey: DataTypes.UUID})
  }
  return Bud
}
