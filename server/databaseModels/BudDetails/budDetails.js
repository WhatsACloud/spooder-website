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
        pronounciation: {
          type: DataTypes.STRING,
          allowNull: true
        }
      }
    )
    BudDetails.associate = (models) => {
      BudDetails.belongsTo(models.Bud)
      BudDetails.hasMany(models.Contexts, {foreignKey: DataTypes.UUID, onDelete: 'cascade'})
    }
    return BudDetails
  }