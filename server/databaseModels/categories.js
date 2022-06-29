module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
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
      categId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }
  )
  Category.associate = (models) => {
    Category.belongsTo(models.Spoodawebs)
    Category.hasMany(models.Bud, {foreignKey: DataTypes.UUID})
  }
  return Category
}