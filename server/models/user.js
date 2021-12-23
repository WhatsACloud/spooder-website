module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
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
      }
    }
  )
  User.associate = function (models) {
    // associations can be defined here
    console.log(models)
    User.hasMany(models.Article, {foreignKey: DataTypes.UUID})
  }
  return User
}