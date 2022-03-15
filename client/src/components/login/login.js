import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '../../scss/login.module'
import api from '../../services/api'

const registerEndpoint = "/register"

const login = () => {
  let [ canSend, changeStatusSend ] = useState(false); // pls add more reliability
  let [ password, changePassword ] = useState({
    password: "",
    repeatPassword: ""
  })

  function EyeIcon(props) {
    if (props.eye) {
      return <i className={`fa fa-eye ${styles.eye}`}></i>
    } else {
      return <i className={`fa fa-eye-slash ${styles.eye}`}></i>
    }
  }
  
  function signUp(username, email, password, repeatPassword) {
    // console.log(canSend)
    if (password === repeatPassword && username && email && password) {
      api.post(registerEndpoint, {
        "Username": username,
        "Email": email,
        "Password": password
      })
    }
  }
  
  function detectPasswordChange(event) { // pls add next time too lazy now
    
  }
  
  function InputBox(props) {
    return (
      <div className={styles.inputContainer}>
        <label>{props.display}: </label>
        {props.children}
        <input
          type={props.inputType || props.name}
          id={props.name}
          placeholder={props.noenter ? props.display: `Enter ${props.display}`}
          autoCapitalize='none'
          onChange={props.name === "password" || props.name === "repeatPassword" ? detectPasswordChange : null}>
        </input>
      </div>
    )
  }
  
  function PasswordBox(props) {
    const [ visible, toggleVisible ] = useState(false);
    let inputType = "password";
    if (visible) {
      inputType = "text";
    } else {
      inputType = "password";
    }
    return (
      <InputBox name={props.name} display={props.display} inputType={inputType} noenter={props.noenter}>
        <button
          className={styles.passwordIcon}
          onClick={() => toggleVisible(!visible)}
          type="button">
            <EyeIcon eye={visible}></EyeIcon>
        </button>
      </InputBox>
    )
  }

  return (
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
  )
}

export default login;