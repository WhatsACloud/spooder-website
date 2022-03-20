import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { registerSchema } from './userSchema'
import { object } from 'yup'

import styles from '../../scss/user.module'
import { ErrorBox } from '../errorMsg'
import { InputBox, PasswordBox, assignError, userLoginHandler } from './shared'

const registerEndpoint = "/register"

async function signUp(errorStates, changeErrorState, changeServerErrorState, navigate, username, email, password, repeatPassword) {
  // console.log(canSend)
  try {
    const toSend = {
      "Username": username,
      "Email": email,
      "Password": password,
      "RepeatPassword": repeatPassword
    }
    try {
      const result = await registerSchema.validate(toSend, {abortEarly: false})
      delete toSend.RepeatPassword
      assignError(null, null, errorStates, changeErrorState)
      await userLoginHandler(registerEndpoint, toSend, changeServerErrorState, navigate)
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

const Register = () => {
  let navigate = useNavigate()
  let [ errorStates, changeErrorState ] = useState({
    "Username": false,
    "Email": false,
    "Password": false,
    "RepeatPassword": false
  })
  let [ serverErrorState, changeServerErrorState ] = useState('')

  return (
    <>
      <div className={styles.div}>
        <p className={styles.header}>
          Sign up
        </p>
        <form>
          <InputBox name="username" display="Username" errorMsg={errorStates.Username}></InputBox>
          <InputBox name="email" display="Email" errorMsg={errorStates.Email}></InputBox>
          <PasswordBox name="password" display="Password" errorMsg={errorStates.Password}></PasswordBox>
          <PasswordBox name="repeatPassword" display="Repeat Password" errorMsg={errorStates.RepeatPassword} noenter={true}></PasswordBox>
          <div className={serverErrorState ? styles.errorMsg : styles.noMsg}>
            <p>
              {serverErrorState}
            </p>
          </div>
          <button
            type="button"
            className={styles.signUp}
            onClick={() => signUp(
              errorStates,
              changeErrorState,
              changeServerErrorState,
              navigate,
              document.getElementById("username").value,
              document.getElementById("email").value, 
              document.getElementById("password").value,
              document.getElementById("repeatPassword").value
              )}>
              Sign Up
          </button>
        </form>
      </div>
    </>
  )
}

export default Register