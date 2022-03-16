import React from 'react'
import styles from '../../scss/user.module'
import { InputBox } from './shared'

const login = () => {
  return (
    <div>
      <div className={styles.div}>
        <p className={styles.header}>
          Sign up
        </p>
        <form>
          <InputBox name="username" display="Username"></InputBox>
          <InputBox name="email" display="Email"></InputBox>
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

export default login