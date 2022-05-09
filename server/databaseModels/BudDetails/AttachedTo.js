module.exports = (sequelize, DataTypes) => {
  const AttachedTos = sequelize.define(
    'AttachedTo',
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
      attachedToId: {
        type: DataTypes.INTEGER,
        allowNull: false 
      },
      attachedTo: {
        type: DataTypes.INTEGER,
        allowNull: false 
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }
  )
  AttachedTos.associate = (models) => {
    AttachedTos.belongsTo(models.Bud)
  }
  return AttachedTos 
}