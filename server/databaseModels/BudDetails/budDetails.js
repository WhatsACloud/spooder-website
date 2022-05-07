module.exports = (sequelize, DataTypes) => {
    const BudDetails = sequelize.define(
      'BudDetails',
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
        definition: {
            type: DataTypes.STRING,
            allowNull: true
        },
        sound: {
          type: DataTypes.STRING,
          allowNull: true
        },
        context: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
      }
    )
    BudDetails.associate = (models) => {
      BudDetails.belongsTo(models.Bud)
      BudDetails.hasMany(models.Examples, {foreignKey: DataTypes.UUID})
    }
    return BudDetails
  }