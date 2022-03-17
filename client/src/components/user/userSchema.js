import { object, string, ref } from 'yup'

const USERNAME = string('Username should only contain letters and numbers')
                .min(3, 'Username should have a minimum of 3 characters')
                .max(30, 'Username should have a maximum of 3 characters')
                .required('Username is a required field')

const EMAIL = string()
              .email('Email is invalid')
              .required('Email is a required field')

const PASSWORD = string()
                .min(8, 'Password should have at least 8 characters')
                .max(40, 'Password should have at most 40 characters')
                .required('Password is a required field')

const REPEATPASSWORD = string()
                      .when('Password', (Password, registerSchema) => 
                        Password ? registerSchema.oneOf([ref('Password')], 'Passwords do not match') : registerSchema
                      )

const registerSchema = object({
  Username: USERNAME,
  Email: EMAIL,
  Password: PASSWORD,
  RepeatPassword: REPEATPASSWORD
})

export {
  registerSchema
}