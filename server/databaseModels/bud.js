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
      categ_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'Category',
          key: 'id'
        }
      },
      word: {
        type: DataTypes.STRING,
        allowNull: false
      },
      definition: {
          type: DataTypes.STRING,
          allowNull: false 
      },
      sound: {
        type: DataTypes.STRING,
        allowNull: false 
      },
      context: {
        type: DataTypes.STRING,
        allowNull: false 
      },
      link: {
        type: DataTypes.INTEGER,
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
  Bud.associate = (models) => {
    Bud.belongsTo(models.Spoodawebs)
    Bud.hasMany(models.AttachedTo, {foreignKey: DataTypes.UUID})
    Bud.hasMany(models.Category, {foreignKey: DataTypes.UUID})
  }
  return Bud
}
