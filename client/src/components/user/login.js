import React, { useState } from 'react'
import styles from '../../scss/user.module'
import { InputBox, PasswordBox, assignError } from './shared'
import { loginSchema } from './userSchema'

const login = () => {
  let [ errorStates, changeErrorState ] = useState({
    "Username": false,
    "Email": false,
    "Password": false,
    "RepeatPassword": false
  })

  async function Login(email, password) {
    try {
      const toSend = {
        "Email": email,
        "Password": password,
      }
      try {
        const result = await loginSchema.validate(toSend, {abortEarly: false})
        console.log(result)
        console.log('success!')
        assignError(null, null, errorStates, changeErrorState)
      } catch(err) {
        console.log(err)
        const data = err.inner[0]
        console.log(data)
        assignError(data.message, data.path, errorStates, changeErrorState)
      }
      // const res = await api.post(registerEndpoint, toSend)
      // console.log(res)
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <div>
      <div className={styles.div}>
        <p className={styles.header}>
          Login
        </p>
        <form>
          <InputBox name="email" display="Email" errorMsg={errorStates.Email}></InputBox>
          <PasswordBox name="password" display="Password" errorMsg={errorStates.Password}></PasswordBox>
          <button
            type="button"
            className={styles.signUp}
            onClick={() => Login(
              document.getElementById("email").value, 
              document.getElementById("password").value
              )}>
              Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default login