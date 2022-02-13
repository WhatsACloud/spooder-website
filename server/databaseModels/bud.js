module.exports = (sequelize, DataTypes) => {
  const Bud = sequelize.define(
    'Bud',
    {
      fk_spoodaweb_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'Spoodaweb',
          key: 'id'
        }
      },
      word: {
        type: DataTypes.STRING,
        allowNull: false
      },
      definition: {

      },
      pronounciation: {

      },
      audioPronounciation: {

      },
      examples: {

      },

    }
  )
  Bud.associate = (models) => {
    Bud.belongsTo(models.Spoodaweb)
  }
  return Bud
}