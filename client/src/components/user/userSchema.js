import { object, string, ref } from 'yup'

const USERNAME = string('Username should only contain letters and numbers')
                .min(3, 'Username should have a minimum of 3 characters')
                .max(30, 'Username should have a maximum of 3 characters')
                .required('Username is a required field')

const EMAIL = string()
              .required('Email is a required field')

const PASSWORD = string()
                .min(8, 'Password should have at least 8 characters')
                .max(40, 'Password should have at most 40 characters')
                .required('Password is a required field')

const registerSchema = object({
  Username: USERNAME,
  Email: EMAIL.email('Email is invalid'),
  Password: PASSWORD,
})

const loginSchema = object({
  Email: EMAIL,
  Password: string()
           .required()
})

export {
  registerSchema,
  loginSchema
}