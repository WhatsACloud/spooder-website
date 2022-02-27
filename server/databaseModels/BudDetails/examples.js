module.exports = (sequelize, DataTypes) => {
  const Examples = sequelize.define(
    'Examples',
    {
      fk_context_id: {
          type: DataTypes.UUID,
          allowNull: false,
          foreignKey: true,
          references: {
            model: 'Contexts',
            key: 'id'
          }
      },
      example: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }
  )
  Examples.associate = (models) => {
    Examples.belongsTo(models.Contexts)
  }
  return Examples
}