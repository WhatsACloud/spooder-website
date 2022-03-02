module.exports = (sequelize, DataTypes) => {
  const Contexts = sequelize.define(
    'Contexts',
    {
      fk_bud_details_id: {
          type: DataTypes.UUID,
          allowNull: false,
          foreignKey: true,
          references: {
            model: 'BudDetails',
            key: 'id'
          }
      },
      context: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }
  )
  Contexts.associate = (models) => {
    Contexts.belongsTo(models.BudDetails)
    Contexts.hasMany(models.Examples, {foreignKey: DataTypes.UUID})
  }
  return Contexts
}