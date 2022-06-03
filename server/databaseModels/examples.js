module.exports = (sequelize, DataTypes) => {
  const Examples = sequelize.define(
    'Examples',
    {
      fk_bud_id: {
          type: DataTypes.UUID,
          allowNull: false,
          foreignKey: true,
          references: {
            model: 'Buds',
            key: 'id'
          }
      },
      arrID: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    Examples.belongsTo(models.Buds)
  }
  return Examples
}