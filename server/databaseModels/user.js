module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'Users',
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notContains: ' ',
          len: [3,16]
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }
  )
  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Spoodaweb, {foreignKey: DataTypes.UUID})
  }
  return User
}