import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../../services/api'
import { registerSchema } from './userSchema'
import { object } from 'yup'

import styles from '../../scss/user.module'
import { ErrorBox } from '../errorMsg'
import { InputBox, PasswordBox } from './shared'

const registerEndpoint = "/register"

const Register = () => {
  let [ canSend, changeStatusSend ] = useState(false); // pls add more reliability
  let [ errorStates, changeErrorState ] = useState({
    "Username": false,
    "Email": false,
    "Password": false,
    "RepeatPassword": false
  })
  let [state, changeState ] = useState(false)

  function assignError(message, type) {
    console.log(message, type)
    let newObj = {...errorStates}
    for (const state in newObj) {
      newObj[state] = false
    }
    newObj[type] = message
    changeErrorState(newObj)
    console.log(errorStates)
  }
  
  async function signUp(username, email, password, repeatPassword) {
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
        console.log(result)
        console.log('success!')
      } catch(err) {
        const data = err.inner[0]
        console.log(username)
        assignError(data.message, data.path)
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
          Sign up
        </p>
        <form>
          <InputBox name="username" display="Username" errorMsg={errorStates.Username}></InputBox>
          <InputBox name="email" display="Email" errorMsg={errorStates.Email}></InputBox>
          <PasswordBox name="password" display="Password" errorMsg={errorStates.Password}></PasswordBox>
          <PasswordBox name="repeatPassword" display="Repeat Password" errorMsg={errorStates.RepeatPassword} noenter={true}></PasswordBox>
          <button
            type="button"
            className={styles.signUp}
            onClick={() => signUp(
              document.getElementById("username").value,
              document.getElementById("email").value, 
              document.getElementById("password").value,
              document.getElementById("repeatPassword").value
              )}>
              Sign Up
          </button>
          <p>{state}</p>
        </form>
      </div>
    </div>
  )
}

export default Register