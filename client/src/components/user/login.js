import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './user.module'
import { InputBox, PasswordBox, assignError, userLoginHandler } from './shared'
import { loginSchema } from './userSchema'
import Authorizer from '../Authorizer'

const loginEndpoint = '/login'

async function Login(errorStates, changeErrorState, changeServerErrorState, navigate, email, password) {
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
      await userLoginHandler(loginEndpoint, toSend, changeServerErrorState, navigate)
    } catch(err) {
      console.log(err)
      const data = err.inner[0]
      console.log(data)
      assignError(data.message, data.path, errorStates, changeErrorState)
    }
  } catch(err) {
    console.log(err)
  }
}

const login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  let [ errorStates, changeErrorState ] = useState({
    "Username": false,
    "Email": false,
    "Password": false,
    "RepeatPassword": false
  })
  let [ serverErrorState, changeServerErrorState ] = useState(location.state ? location.state.message || '' : '')

  return (
    <>
      <Authorizer navigate={navigate}></Authorizer>
      <div className={styles.div}>
        <p className={styles.header}>
          Login
        </p>
        <form>
          <InputBox name="email" display="Email" errorMsg={errorStates.Email}></InputBox>
          <PasswordBox name="password" display="Password" errorMsg={errorStates.Password}></PasswordBox>
          <div className={serverErrorState ? styles.errorMsg : styles.noMsg}>
            <p>
              {serverErrorState}
            </p>
          </div>
          <button
            type="button"
            className={styles.signUp}
            onClick={() => Login(
              errorStates,
              changeErrorState,
              changeServerErrorState,
              navigate,
              document.getElementById("email").value, 
              document.getElementById("password").value
              )}>
              Login
          </button>
        </form>
      </div>
    </>
  )
}

export default login