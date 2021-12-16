const Joi = require('joi')

const password_schema = Joi.object({
  Username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  Email: Joi.string()
    .email(),
  Password: Joi.string()
    .pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')),
  Repeat_password: Joi.ref('Password')
    .messages({
      
    })
})

module.exports = async (user) => {
  try {
    const value = await password_schema.validateAsync(user)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}