import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '../../scss/user.module'
import api from '../../services/api'
import { ErrorBox } from '../errorMsg'
import { InputBox, PasswordBox } from './shared'

const registerEndpoint = "/register"

const Register = () => {
  let [ canSend, changeStatusSend ] = useState(false); // pls add more reliability
  let [ password, changePassword ] = useState({
    password: "",
    repeatPassword: ""
  })
  
  async function signUp(username, email, password, repeatPassword) {
    // console.log(canSend)
    if (password === repeatPassword && username && email && password) {
      try {
        const res = await api.post(registerEndpoint, {
          "Username": username,
          "Email": email,
          "Password": password
        })
        console.log(res)
      } catch({ response }) {
        console.log(response)
      }
    }
  }

  return (
    <div>
      <div className={styles.div}>
        <p className={styles.header}>
          Sign up
        </p>
        <form>
          <InputBox name="username" display="Username"></InputBox>
          <InputBox name="email" display="Email"></InputBox>
          <PasswordBox name="password" display="Password"></PasswordBox>
          <PasswordBox name="repeatPassword" display="Repeat Password" noenter={true}></PasswordBox>
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
        </form>
      </div>
    </div>
  )
}

export default Register