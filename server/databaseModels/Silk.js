module.exports = (sequelize, DataTypes) => {
  const Silk = sequelize.define(
    'Silk',
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
      attachedTo1: {
        type: DataTypes.INTEGER,
        allowNull: true 
      },
      attachedTo2: {
        type: DataTypes.INTEGER,
        allowNull: true 
      },
      strength: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      x1: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      y1: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      x2: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      y2: {
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
      }
    }
  )
  Silk.associate = (models) => {
    Silk.belongsTo(models.Spoodawebs)
  }
  return Silk 
}
