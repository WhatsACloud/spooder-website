module.exports = (sequelize, DataTypes) => {
  const Examples = sequelize.define(
    'Examples',
    {
      fk_budDetails_id: {
          type: DataTypes.UUID,
          allowNull: false,
          foreignKey: true,
          references: {
            model: 'BudDetails',
            key: 'id'
          }
      },
      example: {
        type: DataTypes.TEXT,
        allowNull: false 
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }
  )
  Examples.associate = (models) => {
    Examples.belongsTo(models.BudDetails)
  }
  return Examples
}